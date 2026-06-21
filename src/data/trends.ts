import type { TrendDataPoint } from '@/types';

const now = new Date();

export function generateTrendData(days: number = 30): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  let totalRisks = 156;
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    const newRisks = Math.floor(Math.random() * 8) + 2;
    const closedRisks = Math.floor(Math.random() * 6) + 1;
    
    totalRisks = totalRisks + newRisks - closedRisks;
    if (totalRisks < 100) totalRisks = 100;
    if (totalRisks > 200) totalRisks = 200;
    
    data.push({
      date: d.toISOString().split('T')[0],
      newRisks,
      closedRisks,
      totalRisks,
    });
  }
  
  return data;
}

export const trendData30Days = generateTrendData(30);
export const trendData7Days = generateTrendData(7);
export const trendData90Days = generateTrendData(90);
