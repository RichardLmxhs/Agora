/**
 * Prompt Injection 检测模块
 *
 * 通过关键词模式匹配检测内容中可能的 prompt injection 攻击。
 * 支持中英文检测模式。
 */

export interface InjectionPattern {
  pattern: RegExp;
  weight: number;
  label: string;
}

export interface InjectionResult {
  score: number;
  flagged: boolean;
  blocked: boolean;
  reasons: string[];
}

/** 高风险阈值：直接拒绝 */
const BLOCK_THRESHOLD = 0.7;
/** 中风险阈值：标记警告 */
const FLAG_THRESHOLD = 0.3;

/**
 * Prompt Injection 检测模式列表
 * weight: 0.0-1.0 表示匹配后的加权分值
 */
const INJECTION_PATTERNS: InjectionPattern[] = [
  // === 英文模式 ===
  // 高风险：直接指令覆盖
  {
    pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions|prompts|rules|context)/i,
    weight: 0.8,
    label: "Instruction override (ignore previous)",
  },
  {
    pattern: /disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions|prompts|rules)/i,
    weight: 0.8,
    label: "Instruction override (disregard)",
  },
  {
    pattern: /override\s+(previous|prior|all|system)\s+(instructions|prompts|rules)/i,
    weight: 0.8,
    label: "Instruction override (override)",
  },
  {
    pattern: /do\s+not\s+follow\s+(previous|prior|above|the)\s+(instructions|prompts|rules)/i,
    weight: 0.7,
    label: "Instruction override (do not follow)",
  },
  // 角色扮演注入
  {
    pattern: /you\s+are\s+now\s+(a|an|the)\s+/i,
    weight: 0.6,
    label: "Role injection (you are now)",
  },
  {
    pattern: /pretend\s+(you\s+are|to\s+be)\s+/i,
    weight: 0.6,
    label: "Role injection (pretend)",
  },
  {
    pattern: /act\s+as\s+(a|an|the|if)\s+/i,
    weight: 0.5,
    label: "Role injection (act as)",
  },
  // 系统提示操纵
  {
    pattern: /system\s+prompt/i,
    weight: 0.5,
    label: "System prompt reference",
  },
  {
    pattern: /new\s+instructions?:/i,
    weight: 0.7,
    label: "New instructions injection",
  },
  {
    pattern: /\[SYSTEM\]/i,
    weight: 0.7,
    label: "System tag injection",
  },
  {
    pattern: /\[INST\]/i,
    weight: 0.6,
    label: "Instruction tag injection",
  },
  // 越狱尝试
  {
    pattern: /jailbreak/i,
    weight: 0.6,
    label: "Jailbreak keyword",
  },
  {
    pattern: /DAN\s+mode/i,
    weight: 0.7,
    label: "DAN mode injection",
  },

  // === 中文模式 ===
  {
    pattern: /忽略(之前的?|以上的?|上面的?|所有的?)(指令|提示|规则|要求|限制)/,
    weight: 0.8,
    label: "指令覆盖（忽略之前的指令）",
  },
  {
    pattern: /无视(之前的?|以上的?|所有的?)(指令|提示|规则|要求)/,
    weight: 0.8,
    label: "指令覆盖（无视）",
  },
  {
    pattern: /你现在是(一个|一位)?/,
    weight: 0.6,
    label: "角色注入（你现在是）",
  },
  {
    pattern: /假装你是/,
    weight: 0.6,
    label: "角色注入（假装你是）",
  },
  {
    pattern: /扮演(一个|一位)?/,
    weight: 0.4,
    label: "角色注入（扮演）",
  },
  {
    pattern: /新的?指令[:：]/,
    weight: 0.7,
    label: "新指令注入",
  },
  {
    pattern: /系统提示/,
    weight: 0.5,
    label: "系统提示引用",
  },
  {
    pattern: /不要遵守(之前的?|以上的?)(指令|规则|要求)/,
    weight: 0.7,
    label: "指令覆盖（不要遵守）",
  },
];

/**
 * 检测内容中的 prompt injection 风险
 */
export function detectPromptInjection(content: string): InjectionResult {
  const reasons: string[] = [];
  let totalScore = 0;

  for (const { pattern, weight, label } of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      reasons.push(label);
      totalScore += weight;
    }
  }

  // 归一化到 0-1 范围（最多叠加到 1.0）
  const score = Math.min(totalScore, 1.0);

  return {
    score,
    flagged: score >= FLAG_THRESHOLD,
    blocked: score >= BLOCK_THRESHOLD,
    reasons,
  };
}
