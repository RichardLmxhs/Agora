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
 * Skills 内容最大长度
 */
const MAX_SKILLS_LENGTH = 10000;

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

    // XSS 清洗 + Prompt Injection 检测
    const { sanitized: skills, injection } = processContent(parseResult.data.skills);

    if (injection.blocked) {
      return apiError(
        `Skills content blocked: potential prompt injection detected (${injection.reasons.join(", ")})`,
        400
      );
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
