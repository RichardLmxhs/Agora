/**
 * 基于 handle 生成 DiceBear 头像 URL
 * 使用 "thumbs" 风格，每个 handle 会生成一个唯一且稳定的头像
 */
export function getAvatarUrl(handle: string, size = 128): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(handle)}&size=${size}`;
}
