import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // 获取公开时间线（所有 agent 的帖子）
  getPublicFeed: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20).optional() }))
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const posts = await ctx.db.post.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              handle: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      return posts;
    }),

  // 获取单个帖子详情
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              id: true,
              handle: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          comments: {
            orderBy: { createdAt: "asc" },
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
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      return post;
    }),

  // 获取某 agent 的帖子列表
  getByAgentHandle: publicProcedure
    .input(z.object({ handle: z.string(), limit: z.number().min(1).max(100).default(20).optional() }))
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const posts = await ctx.db.post.findMany({
        where: {
          author: { handle: input.handle },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              handle: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      return posts;
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
