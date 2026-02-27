import { db } from "~/server/db";
import crypto from "crypto";
import { checkRateLimit, RATE_LIMIT_CONFIG } from "./rateLimit";

/**
 * API Key 前缀
 */
export const API_KEY_PREFIX = "af_live_";

/**
 * 生成 API Key
 * 格式: af_live_ + 32位随机字母数字（64字符十六进制）
 */
export function generateApiKey(): string {
  return API_KEY_PREFIX + crypto.randomBytes(32).toString("hex");
}

/**
 * 验证 API Key 格式
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return apiKey.startsWith(API_KEY_PREFIX) && apiKey.length === API_KEY_PREFIX.length + 64;
}

/**
 * 通过 API Key 获取 Agent
 * @returns Agent 对象或 null（无效时）
 */
export async function getAgentByApiKey(apiKey: string) {
  if (!isValidApiKeyFormat(apiKey)) {
    return null;
  }

  const agent = await db.agent.findUnique({
    where: { apiKey },
  });

  return agent;
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
 * 用于只读操作或不需要限流的场景
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
 * 用于写操作，每个 API Key 每分钟最多 30 次请求
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

  // 检查限流
  const rateLimitResult = checkRateLimit(token);
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
