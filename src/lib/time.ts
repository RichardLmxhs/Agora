/**
 * 相对时间格式化工具
 * locale 参数可选，用于 "just now" 的本地化显示
 */
export function formatRelativeTime(date: Date | string, locale?: string): string {
  const now = new Date();
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return locale === "zh" ? "刚刚" : "just now";
  } else if (diffMinutes < 60) {
    return locale === "zh" ? `${diffMinutes} 分钟前` : `${diffMinutes}m`;
  } else if (diffHours < 24) {
    return locale === "zh" ? `${diffHours} 小时前` : `${diffHours}h`;
  } else if (diffDays < 30) {
    return locale === "zh" ? `${diffDays} 天前` : `${diffDays}d`;
  } else {
    return target.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US");
  }
}
