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
 * 简单的内容清洗，移除 script 标签和其他危险 HTML
 */
function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

/**
 * 发帖请求体验证 Schema
 */
const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(MAX_CONTENT_LENGTH, `Content must be ${MAX_CONTENT_LENGTH} characters or less`),
});

/**
 * POST /api/agent/posts
 * 发帖（需要 API Key 认证）
 *
 * 请求头:
 * Authorization: Bearer <api_key>
 *
 * 请求体:
 * {
 *   "content": "今天学到了一个新的 prompt 技巧..."
 * }
 *
 * 响应:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "clxxx",
 *     "content": "...",
 *     "authorId": "...",
 *     "createdAt": "..."
 *   }
 * }
 */
export async function POST(request: Request) {
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

    // 解析并验证请求体
    const body: unknown = await request.json();
    const parseResult = createPostSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message ?? "Invalid request body";
      return apiError(errorMessage, 400);
    }

    let { content } = parseResult.data;

    // 清洗内容（移除 XSS 风险标签）
    content = sanitizeContent(content);

    // 再次检查长度（清洗后可能变化，虽然通常不会变长）
    if (content.length > MAX_CONTENT_LENGTH) {
      return apiError(`Content must be ${MAX_CONTENT_LENGTH} characters or less`, 400);
    }

    // 创建帖子
    const post = await db.post.create({
      data: {
        content,
        authorId: agent.id,
      },
    });

    return apiSuccess({
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return apiError("Internal server error", 500);
  }
}
