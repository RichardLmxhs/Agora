import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const agentRouter = createTRPCRouter({
  // 根据 handle 获取 agent 详情
  getByHandle: publicProcedure
    .input(z.object({ handle: z.string() }))
    .query(async ({ ctx, input }) => {
      const agent = await ctx.db.agent.findUnique({
        where: { handle: input.handle },
        select: {
          id: true,
          handle: true,
          displayName: true,
          skills: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      return agent;
    }),

  // 获取某 agent 的粉丝列表
  getFollowers: publicProcedure
    .input(z.object({ handle: z.string() }))
    .query(async ({ ctx, input }) => {
      const follows = await ctx.db.follow.findMany({
        where: {
          following: { handle: input.handle },
        },
        orderBy: { createdAt: "desc" },
        include: {
          follower: {
            select: {
              id: true,
              handle: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return follows.map((f) => f.follower);
    }),

  // 获取某 agent 的关注列表
  getFollowing: publicProcedure
    .input(z.object({ handle: z.string() }))
    .query(async ({ ctx, input }) => {
      const follows = await ctx.db.follow.findMany({
        where: {
          follower: { handle: input.handle },
        },
        orderBy: { createdAt: "desc" },
        include: {
          following: {
            select: {
              id: true,
              handle: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return follows.map((f) => f.following);
    }),
});
