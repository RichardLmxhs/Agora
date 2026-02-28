import { db } from "~/server/db";
import crypto from "crypto";
import { checkRateLimit, RATE_LIMIT_CONFIG } from "./rateLimit";

/**
 * API Key 前缀
 */
export const API_KEY_PREFIX = "af_live_";

/**
 * 轮换过渡期（毫秒）— 5 分钟
 */
const KEY_ROTATION_GRACE_PERIOD_MS = 5 * 60 * 1000;

/**
 * SHA-256 哈希 API Key
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * 提取 API Key 前缀（前 12 位），用于前端展示
 */
export function getApiKeyPrefix(key: string): string {
  return key.slice(0, 12);
}

/**
 * 生成 API Key，返回明文、哈希和前缀
 */
export function generateApiKey(): { plainKey: string; hashedKey: string; prefix: string } {
  const plainKey = API_KEY_PREFIX + crypto.randomBytes(32).toString("hex");
  const hashedKey = hashApiKey(plainKey);
  const prefix = getApiKeyPrefix(plainKey);
  return { plainKey, hashedKey, prefix };
}

/**
 * 计算轮换过渡期到期时间
 */
export function getKeyRotationExpiresAt(): Date {
  return new Date(Date.now() + KEY_ROTATION_GRACE_PERIOD_MS);
}

/**
 * 验证 API Key 格式
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return apiKey.startsWith(API_KEY_PREFIX) && apiKey.length === API_KEY_PREFIX.length + 64;
}

/**
 * 通过 API Key 获取 Agent
 * 先匹配当前 apiKey（哈希），再匹配 oldApiKey（过渡期内）
 */
export async function getAgentByApiKey(apiKey: string) {
  if (!isValidApiKeyFormat(apiKey)) {
    return null;
  }

  const hashed = hashApiKey(apiKey);

  // 先查当前 Key
  const agent = await db.agent.findUnique({
    where: { apiKey: hashed },
  });

  if (agent) return agent;

  // 再查旧 Key（过渡期内）
  const agentWithOldKey = await db.agent.findFirst({
    where: {
      oldApiKey: hashed,
      oldKeyExpiresAt: { gt: new Date() },
    },
  });

  return agentWithOldKey;
}

/**
 * 从请求头提取 Bearer Token
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1] ?? null;
}

/**
 * 验证请求并返回 Agent（不含限流）
 */
export async function authenticateRequest(authHeader: string | null) {
  const token = extractBearerToken(authHeader);
  if (!token) {
    return { success: false, error: "Missing or invalid Authorization header", status: 401 };
  }

  const agent = await getAgentByApiKey(token);
  if (!agent) {
    return { success: false, error: "Invalid API key", status: 401 };
  }

  return { success: true, agent };
}

/**
 * 验证请求并返回 Agent（包含限流检查）
 * 限流使用 agent.id 作为 key（而非明文 token），避免哈希前后不一致
 */
export async function authenticateRequestWithRateLimit(authHeader: string | null) {
  const token = extractBearerToken(authHeader);
  if (!token) {
    return {
      success: false,
      error: "Missing or invalid Authorization header",
      status: 401,
      rateLimitInfo: null,
    };
  }

  const agent = await getAgentByApiKey(token);
  if (!agent) {
    return {
      success: false,
      error: "Invalid API key",
      status: 401,
      rateLimitInfo: null,
    };
  }

  // 使用 agent.id 作为限流 key（稳定且不泄露 token）
  const rateLimitResult = checkRateLimit(agent.id);
  const rateLimitInfo = {
    limit: RATE_LIMIT_CONFIG.maxRequests,
    remaining: rateLimitResult.remaining,
    reset: Math.floor(rateLimitResult.resetAt / 1000),
  };

  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`,
      status: 429,
      rateLimitInfo,
      retryAfter: rateLimitResult.retryAfter,
    };
  }

  return {
    success: true,
    agent,
    rateLimitInfo,
  };
}

/**
 * 创建带限流响应头的 Response
 */
export function createRateLimitResponse(
  error: string,
  status: number,
  rateLimitInfo: { limit: number; remaining: number; reset: number } | null,
  retryAfter?: number
): Response {
  const headers: Record<string, string> = {};

  if (rateLimitInfo) {
    headers["X-RateLimit-Limit"] = String(rateLimitInfo.limit);
    headers["X-RateLimit-Remaining"] = String(rateLimitInfo.remaining);
    headers["X-RateLimit-Reset"] = String(rateLimitInfo.reset);
  }

  if (retryAfter) {
    headers["Retry-After"] = String(retryAfter);
  }

  return Response.json({ success: false, error }, { status, headers });
}

/**
 * API 响应工具函数
 */
export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function apiError(error: string, status = 400): Response {
  return Response.json({ success: false, error }, { status });
}
