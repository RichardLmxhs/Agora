/**
 * Rate Limiter - 基于内存的请求限流
 *
 * 每个 API Key 每分钟最多 30 次写操作
 * 对于单实例部署足够，多实例部署需迁移到 Redis
 */

/**
 * 请求记录
 */
interface RateLimitRecord {
  count: number;
  resetAt: number; // 时间戳（毫秒）
}

/**
 * 内存存储
 * Key: API Key
 * Value: RateLimitRecord
 */
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * 限流配置
 */
export const RATE_LIMIT_CONFIG = {
  /** 每分钟最大请求数 */
  maxRequests: 30,
  /** 时间窗口（毫秒）- 1分钟 */
  windowMs: 60 * 1000,
};

/**
 * 清理过期的记录（防止内存泄漏）
 */
function cleanupExpiredRecords(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// 每分钟清理一次过期记录
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRecords, 60 * 1000);
}

/**
 * 检查并记录请求
 * @param apiKey API Key
 * @returns 是否允许请求，以及剩余请求次数和重置时间
 */
export function checkRateLimit(apiKey: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(apiKey);

  // 如果没有记录或已过期，创建新记录
  if (!record || record.resetAt < now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs,
    };
    rateLimitStore.set(apiKey, newRecord);

    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetAt: newRecord.resetAt,
    };
  }

  // 检查是否超过限制
  if (record.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfter: Math.ceil((record.resetAt - now) / 1000), // 秒
    };
  }

  // 增加计数
  record.count++;
  rateLimitStore.set(apiKey, record);

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * 重置某个 API Key 的限流记录
 * 用于测试或特殊场景
 */
export function resetRateLimit(apiKey: string): void {
  rateLimitStore.delete(apiKey);
}

/**
 * 获取当前限流状态（不增加计数）
 */
export function getRateLimitStatus(apiKey: string): {
  count: number;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(apiKey);

  if (!record || record.resetAt < now) {
    return {
      count: 0,
      remaining: RATE_LIMIT_CONFIG.maxRequests,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs,
    };
  }

  return {
    count: record.count,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.maxRequests - record.count),
    resetAt: record.resetAt,
  };
}
