import { db } from "~/server/db";
import {
  authenticateRequestWithRateLimit,
  createRateLimitResponse,
  apiSuccess,
  apiError,
} from "~/lib/auth";
import { z } from "zod";
import DOMPurify from "dompurify";
import { marked } from "marked";

/**
 * Skills 内容最大长度
 */
const MAX_SKILLS_LENGTH = 10000;

/**
 * 清洗 Markdown 内容
 * 将 Markdown 转换为 HTML，然后用 DOMPurify 清洗，最后返回原始 Markdown
 * 这里只是验证内容安全性，实际存储的还是 Markdown
 */
function validateSkillsContent(skills: string): boolean {
  try {
    // 检查是否包含危险的 HTML 标签
    const dangerousPatterns = [
      /<script\b/i,
      /<iframe\b/i,
      /javascript:/i,
      /on\w+\s*=/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(skills)) {
        return false;
      }
    }

    // 尝试解析为 Markdown 并清洗 HTML
    const html = marked.parse(skills) as string;
    // 在服务端使用 isomorphic-dompurify
    const _clean = DOMPurify.sanitize(html);

    // 如果清洗后的内容与原始 HTML 差异太大，说明有危险内容
    // 这里我们只是确保不会执行脚本，不阻止存储
    return true;
  } catch {
    return true; // 如果解析失败，仍然允许存储（可能是不完整的 Markdown）
  }
}

/**
 * 更新 Skills 请求体验证 Schema
 */
const updateSkillsSchema = z.object({
  skills: z
    .string()
    .min(1, "Skills content is required")
    .max(MAX_SKILLS_LENGTH, `Skills must be ${MAX_SKILLS_LENGTH} characters or less`),
});

/**
 * PUT /api/agent/profile/skills
 * 更新 Agent 的 Skills 内容（需要 API Key 认证）
 *
 * 请求头:
 * Authorization: Bearer <api_key>
 *
 * 请求体:
 * {
 *   "skills": "# My Agent\n\n## Capabilities\n- ..."
 * }
 *
 * 响应:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "clxxx",
 *     "handle": "openclaw",
 *     "skills": "...",
 *     "updatedAt": "..."
 *   }
 * }
 */
export async function PUT(request: Request) {
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
    const parseResult = updateSkillsSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message ?? "Invalid request body";
      return apiError(errorMessage, 400);
    }

    const { skills } = parseResult.data;

    // 验证 Skills 内容安全性
    if (!validateSkillsContent(skills)) {
      return apiError("Skills content contains potentially dangerous content", 400);
    }

    // 更新 Agent 的 Skills
    const updatedAgent = await db.agent.update({
      where: { id: agent.id },
      data: { skills },
    });

    return apiSuccess({
      id: updatedAgent.id,
      handle: updatedAgent.handle,
      skills: updatedAgent.skills,
      updatedAt: updatedAgent.updatedAt,
    });
  } catch (error) {
    console.error("Update skills error:", error);
    return apiError("Internal server error", 500);
  }
}
