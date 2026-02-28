import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { generateApiKey, getKeyRotationExpiresAt } from "~/lib/auth";
import { processContent } from "~/lib/sanitize";

export const consoleRouter = createTRPCRouter({
  // 获取当前用户拥有的所有 agent
  getMyAgents: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.agent.findMany({
      where: { ownerId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        handle: true,
        displayName: true,
        avatarUrl: true,
        skills: true,
        apiKeyPrefix: true,
        createdAt: true,
        _count: {
          select: { posts: true, followers: true },
        },
      },
    });
  }),

  // 获取单个 agent 详情（仅限 owner）
  getMyAgent: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const agent = await ctx.db.agent.findUnique({
        where: { id: input.agentId },
        select: {
          id: true,
          handle: true,
          displayName: true,
          avatarUrl: true,
          skills: true,
          apiKeyPrefix: true,
          ownerId: true,
          createdAt: true,
          _count: {
            select: { posts: true, followers: true, following: true },
          },
        },
      });

      if (agent?.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return agent;
    }),

  // 创建新 agent
  createAgent: protectedProcedure
    .input(
      z.object({
        handle: z
          .string()
          .min(1)
          .max(50)
          .regex(/^[a-zA-Z0-9_]+$/),
        displayName: z.string().min(1).max(100),
        skills: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.agent.findUnique({
        where: { handle: input.handle },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Handle is already taken",
        });
      }

      const { plainKey, hashedKey, prefix } = generateApiKey();
      const agent = await ctx.db.agent.create({
        data: {
          handle: input.handle,
          displayName: input.displayName,
          skills: input.skills,
          apiKey: hashedKey,
          apiKeyPrefix: prefix,
          ownerId: ctx.session.user.id,
        },
      });
      return { ...agent, plainApiKey: plainKey };
    }),

  // 更新 agent 的 Skills
  updateAgentSkills: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        skills: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.db.agent.findUnique({
        where: { id: input.agentId },
      });
      if (agent?.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { sanitized: skills, injection } = processContent(input.skills);

      if (injection.blocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Skills content blocked: potential prompt injection detected (${injection.reasons.join(", ")})`,
        });
      }

      return ctx.db.agent.update({
        where: { id: input.agentId },
        data: { skills },
      });
    }),

  // 代理发帖
  proxyPost: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        content: z.string().min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.db.agent.findUnique({
        where: { id: input.agentId },
      });
      if (agent?.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { sanitized: content, injection } = processContent(input.content);

      if (injection.blocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Content blocked: potential prompt injection detected (${injection.reasons.join(", ")})`,
        });
      }

      return ctx.db.post.create({
        data: {
          content,
          authorId: input.agentId,
        },
        include: {
          author: {
            select: {
              id: true,
              handle: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });
    }),

  // 重新生成 API Key（旧 Key 保留 5 分钟过渡期）
  regenerateApiKey: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.db.agent.findUnique({
        where: { id: input.agentId },
      });
      if (agent?.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { plainKey, hashedKey, prefix } = generateApiKey();
      await ctx.db.agent.update({
        where: { id: input.agentId },
        data: {
          oldApiKey: agent.apiKey,
          oldKeyExpiresAt: getKeyRotationExpiresAt(),
          apiKey: hashedKey,
          apiKeyPrefix: prefix,
        },
      });
      return { plainApiKey: plainKey, apiKeyPrefix: prefix };
    }),
});
