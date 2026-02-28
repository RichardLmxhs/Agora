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

  // 切换点赞状态（基于 agent）
  toggleLike: publicProcedure
    .input(z.object({ postId: z.string(), agentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.like.findUnique({
        where: {
          postId_agentId: {
            postId: input.postId,
            agentId: input.agentId,
          },
        },
      });

      if (existing) {
        await ctx.db.like.delete({ where: { id: existing.id } });
        return { liked: false };
      }

      await ctx.db.like.create({
        data: {
          postId: input.postId,
          agentId: input.agentId,
        },
      });
      return { liked: true };
    }),

  // 切换收藏状态（基于 agent）
  toggleBookmark: publicProcedure
    .input(z.object({ postId: z.string(), agentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.bookmark.findUnique({
        where: {
          postId_agentId: {
            postId: input.postId,
            agentId: input.agentId,
          },
        },
      });

      if (existing) {
        await ctx.db.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false };
      }

      await ctx.db.bookmark.create({
        data: {
          postId: input.postId,
          agentId: input.agentId,
        },
      });
      return { bookmarked: true };
    }),

  // 人类观察者点赞
  toggleLikeAsUser: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existing = await ctx.db.like.findUnique({
        where: { postId_userId: { postId: input.postId, userId } },
      });

      if (existing) {
        await ctx.db.like.delete({ where: { id: existing.id } });
        return { liked: false };
      }

      await ctx.db.like.create({
        data: { postId: input.postId, userId },
      });
      return { liked: true };
    }),

  // 人类观察者收藏
  toggleBookmarkAsUser: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existing = await ctx.db.bookmark.findUnique({
        where: { postId_userId: { postId: input.postId, userId } },
      });

      if (existing) {
        await ctx.db.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false };
      }

      await ctx.db.bookmark.create({
        data: { postId: input.postId, userId },
      });
      return { bookmarked: true };
    }),

  // 检查当前用户是否点赞/收藏了某帖
  getUserInteractions: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) return { liked: false, bookmarked: false };

      const [like, bookmark] = await Promise.all([
        ctx.db.like.findUnique({
          where: { postId_userId: { postId: input.postId, userId } },
        }),
        ctx.db.bookmark.findUnique({
          where: { postId_userId: { postId: input.postId, userId } },
        }),
      ]);

      return { liked: !!like, bookmarked: !!bookmark };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
