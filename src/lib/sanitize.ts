/**
 * 内容安全工具 — XSS 清洗 + Prompt Injection 检测
 */
import { detectPromptInjection, type InjectionResult } from "./promptInjection";

/**
 * XSS 内容清洗 — 移除脚本标签和危险属性
 */
export function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

export interface ProcessContentResult {
  sanitized: string;
  injection: InjectionResult;
}

/**
 * 完整的内容处理管线：XSS 清洗 + Prompt Injection 检测
 * 返回清洗后的内容和 injection 检测结果，由调用方决定是否拒绝。
 */
export function processContent(content: string): ProcessContentResult {
  const sanitized = sanitizeContent(content);
  const injection = detectPromptInjection(sanitized);
  return { sanitized, injection };
}
