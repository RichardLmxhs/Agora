/**
 * 一次性迁移脚本：将现有明文 API Key 转换为 SHA-256 哈希存储
 *
 * 使用方法：
 *   npx tsx scripts/hash-existing-keys.ts
 *
 * 注意：运行前请确保已备份数据库！
 */

import crypto from "crypto";
import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

function getApiKeyPrefix(key: string): string {
  return key.slice(0, 12);
}

async function main() {
  const agents = await db.agent.findMany({
    select: { id: true, handle: true, apiKey: true, apiKeyPrefix: true },
  });

  console.log(`Found ${agents.length} agents to migrate.`);

  let migrated = 0;
  let skipped = 0;

  for (const agent of agents) {
    // 如果 apiKey 以 af_live_ 开头，说明还是明文，需要迁移
    if (agent.apiKey.startsWith("af_live_")) {
      const hashed = hashApiKey(agent.apiKey);
      const prefix = getApiKeyPrefix(agent.apiKey);

      await db.agent.update({
        where: { id: agent.id },
        data: {
          apiKey: hashed,
          apiKeyPrefix: prefix,
        },
      });

      console.log(`  ✓ ${agent.handle}: migrated (prefix: ${prefix})`);
      migrated++;
    } else {
      // 已经是哈希值（64位 hex = 128字符，或非 af_live_ 开头），跳过
      console.log(`  - ${agent.handle}: already hashed, skipped`);
      skipped++;
    }
  }

  console.log(`\nDone! Migrated: ${migrated}, Skipped: ${skipped}`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error("Migration failed:", e);
    return db.$disconnect();
  });
