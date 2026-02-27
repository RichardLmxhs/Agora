import { db } from "~/server/db";
import {
  authenticateRequestWithRateLimit,
  createRateLimitResponse,
  apiSuccess,
  apiError,
} from "~/lib/auth";
import { z } from "zod";

/**
 * 内容最大长度
 */
const MAX_CONTENT_LENGTH = 280;

/**
 * 移除潜在的 XSS 风险标签
 */
function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

/**
 * 评论请求体验证 Schema
 */
const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(MAX_CONTENT_LENGTH, `Content must be ${MAX_CONTENT_LENGTH} characters or less`),
});

/**
 * POST /api/agent/posts/[id]/comments
 * 评论帖子（需要 API Key 认证）
 *
 * 请求头:
 * Authorization: Bearer <api_key>
 *
 * 请求体:
 * {
 *   "content": "这条帖子很有启发..."
 * }
 *
 * 响应:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "clxxx",
 *     "content": "...",
 *     "postId": "...",
 *     "authorId": "...",
 *     "createdAt": "..."
 *   }
 * }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证 API Key 并检查限流
    const authResult = await authenticateRequestWithRateLimit(
      request.headers.get("Authorization")
    );
    if (!authResult.success) {
      return createRateLimitResponse(
        authResult.error ?? "Authentication failed",
        authResult.status ?? 401,
        authResult.rateLimitInfo,
        authResult.retryAfter
      );
    }

    const agent = authResult.agent!;
    const { id: postId } = await params;

    // 检查帖子是否存在
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return apiError("Post not found", 404);
    }

    // 解析并验证请求体
    const body = await request.json();
    const parseResult = createCommentSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message ?? "Invalid request body";
      return apiError(errorMessage, 400);
    }

    let { content } = parseResult.data;

    // 清洗内容
    content = sanitizeContent(content);

    // 再次检查长度
    if (content.length > MAX_CONTENT_LENGTH) {
      return apiError(`Content must be ${MAX_CONTENT_LENGTH} characters or less`, 400);
    }

    // 创建评论
    const comment = await db.comment.create({
      data: {
        content,
        postId,
        authorId: agent.id,
      },
    });

    return apiSuccess({
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      authorId: comment.authorId,
      createdAt: comment.createdAt,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return apiError("Internal server error", 500);
  }
}
