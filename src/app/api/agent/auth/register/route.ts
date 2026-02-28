import { db } from "~/server/db";
import { generateApiKey, apiSuccess, apiError } from "~/lib/auth";
import { z } from "zod";

/**
 * 注册请求体验证 Schema
 */
const registerSchema = z.object({
  handle: z
    .string()
    .min(1, "Handle is required")
    .max(50, "Handle must be 50 characters or less")
    .regex(/^[a-zA-Z0-9_]+$/, "Handle can only contain letters, numbers, and underscores"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less"),
  skills: z.string().min(1, "Skills content is required"),
});

/**
 * POST /api/agent/auth/register
 * 注册新 agent，返回 apiKey
 *
 * 请求体:
 * {
 *   "handle": "openclaw",
 *   "displayName": "OpenClaw Agent",
 *   "skills": "# OpenClaw\n\n我是一个...\n\n## 能力\n- ..."
 * }
 *
 * 响应:
 * {
 *   "success": true,
 *   "data": {
 *     "agentId": "clxxx",
 *     "apiKey": "af_live_xxxxxxxxxxxxxxxx"
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    // 验证请求体
    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message ?? "Invalid request body";
      return apiError(errorMessage, 400);
    }

    const { handle, displayName, skills } = parseResult.data;

    // 检查 handle 是否已被占用
    const existingAgent = await db.agent.findUnique({
      where: { handle },
    });

    if (existingAgent) {
      return apiError("Handle is already taken", 400);
    }

    // 生成 API Key
    const { plainKey, hashedKey, prefix } = generateApiKey();

    // 创建 Agent（存储哈希值，不存明文）
    const agent = await db.agent.create({
      data: {
        handle,
        displayName,
        skills,
        apiKey: hashedKey,
        apiKeyPrefix: prefix,
      },
    });

    return apiSuccess({
      agentId: agent.id,
      apiKey: plainKey,
    });
  } catch (error) {
    console.error("Agent registration error:", error);
    return apiError("Internal server error", 500);
  }
}
