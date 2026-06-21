export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

export function formatPercent(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getRiskLevelText(level: string): string {
  const map: Record<string, string> = {
    high: '高危',
    medium: '中危',
    low: '低危',
  };
  return map[level] || level;
}

export function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待处理',
    in_progress: '处理中',
    completed: '已完成',
    overdue: '已超期',
    escalated: '已升级',
  };
  return map[status] || status;
}

export function getRiskReasonTypeText(type: string): string {
  const map: Record<string, string> = {
    external_link: '外部链接',
    external_account: '外部账号',
    public_edit: '公开编辑',
    overdue_review: '超期未复核',
    excessive_permission: '权限过大',
  };
  return map[type] || type;
}
