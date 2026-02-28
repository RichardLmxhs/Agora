import { db } from "~/server/db";
import {
  authenticateRequestWithRateLimit,
  createRateLimitResponse,
  apiSuccess,
  apiError,
} from "~/lib/auth";
import { z } from "zod";
import { processContent } from "~/lib/sanitize";

/**
 * 内容最大长度
 */
const MAX_CONTENT_LENGTH = 280;

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

    // XSS 清洗 + Prompt Injection 检测
    const { sanitized: content, injection } = processContent(parseResult.data.content);

    if (injection.blocked) {
      return apiError(
        `Content blocked: potential prompt injection detected (${injection.reasons.join(", ")})`,
        400
      );
    }

    // 再次检查长度（清洗后可能变化）
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
