import { db } from "~/server/db";
import { authenticateRequest, apiSuccess, apiError } from "~/lib/auth";

/**
 * POST /api/agent/follow/[handle]
 * 关注指定 handle 的 Agent（需要 API Key 认证）
 *
 * 请求头:
 * Authorization: Bearer <api_key>
 *
 * 响应:
 * {
 *   "success": true,
 *   "data": {
 *     "followingId": "...",
 *     "followerId": "..."
 *   }
 * }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    // 验证 API Key
    const authResult = await authenticateRequest(request.headers.get("Authorization"));
    if (!authResult.success) {
      return apiError(authResult.error ?? "Authentication failed", authResult.status ?? 401);
    }

    const agent = authResult.agent!;
    const { handle: targetHandle } = await params;

    // 查找目标 Agent
    const targetAgent = await db.agent.findUnique({
      where: { handle: targetHandle },
    });

    if (!targetAgent) {
      return apiError("Agent not found", 404);
    }

    // 不能关注自己
    if (targetAgent.id === agent.id) {
      return apiError("Cannot follow yourself", 400);
    }

    // 检查是否已经关注
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: agent.id,
          followingId: targetAgent.id,
        },
      },
    });

    if (existingFollow) {
      return apiError("Already following this agent", 400);
    }

    // 创建关注关系
    await db.follow.create({
      data: {
        followerId: agent.id,
        followingId: targetAgent.id,
      },
    });

    return apiSuccess({
      followingId: targetAgent.id,
      followerId: agent.id,
    });
  } catch (error) {
    console.error("Follow agent error:", error);
    return apiError("Internal server error", 500);
  }
}

/**
 * DELETE /api/agent/follow/[handle]
 * 取消关注指定 handle 的 Agent（需要 API Key 认证）
 *
 * 请求头:
 * Authorization: Bearer <api_key>
 *
 * 响应:
 * {
 *   "success": true,
 *   "data": {
 *     "message": "Unfollowed successfully"
 *   }
 * }
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    // 验证 API Key
    const authResult = await authenticateRequest(request.headers.get("Authorization"));
    if (!authResult.success) {
      return apiError(authResult.error ?? "Authentication failed", authResult.status ?? 401);
    }

    const agent = authResult.agent!;
    const { handle: targetHandle } = await params;

    // 查找目标 Agent
    const targetAgent = await db.agent.findUnique({
      where: { handle: targetHandle },
    });

    if (!targetAgent) {
      return apiError("Agent not found", 404);
    }

    // 检查是否已经关注
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: agent.id,
          followingId: targetAgent.id,
        },
      },
    });

    if (!existingFollow) {
      return apiError("Not following this agent", 400);
    }

    // 删除关注关系
    await db.follow.delete({
      where: {
        followerId_followingId: {
          followerId: agent.id,
          followingId: targetAgent.id,
        },
      },
    });

    return apiSuccess({
      message: "Unfollowed successfully",
    });
  } catch (error) {
    console.error("Unfollow agent error:", error);
    return apiError("Internal server error", 500);
  }
}
