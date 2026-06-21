import type { MonthlyReport, RecurringIssue, DepartmentRanking, TodoItem } from '@/types';
import { allFolders } from './folders';

export const recurringIssues: RecurringIssue[] = [
  {
    id: 'ri-001',
    description: '项目文件夹默认设置公开外链',
    occurrenceCount: 12,
    lastOccurrence: '2026-06-18',
    affectedDepartments: ['研发中心', '市场部', '运营部'],
  },
  {
    id: 'ri-002',
    description: '外部供应商账号长期未清理',
    occurrenceCount: 8,
    lastOccurrence: '2026-06-15',
    affectedDepartments: ['研发中心', '财务部'],
  },
  {
    id: 'ri-003',
    description: '已离职员工权限未及时回收',
    occurrenceCount: 6,
    lastOccurrence: '2026-06-10',
    affectedDepartments: ['销售部', '人力资源部'],
  },
  {
    id: 'ri-004',
    description: '超期未复核文件夹反复出现',
    occurrenceCount: 15,
    lastOccurrence: '2026-06-20',
    affectedDepartments: ['运营部', '销售部', '市场部'],
  },
  {
    id: 'ri-005',
    description: '全员管理权限配置不规范',
    occurrenceCount: 5,
    lastOccurrence: '2026-06-08',
    affectedDepartments: ['研发中心', '产品部'],
  },
];

export const departmentRankings: DepartmentRanking[] = [
  { departmentId: 'dept-008', departmentName: '法务部', score: 92, improvement: 5.2 },
  { departmentId: 'dept-003', departmentName: '财务部', score: 88, improvement: 3.8 },
  { departmentId: 'dept-006', departmentName: '产品部', score: 81, improvement: 6.5 },
  { departmentId: 'dept-004', departmentName: '人力资源部', score: 78, improvement: 2.1 },
  { departmentId: 'dept-002', departmentName: '市场部', score: 72, improvement: -1.3 },
  { departmentId: 'dept-001', departmentName: '研发中心', score: 65, improvement: 4.7 },
  { departmentId: 'dept-005', departmentName: '运营部', score: 58, improvement: -2.5 },
  { departmentId: 'dept-007', departmentName: '销售部', score: 52, improvement: -3.8 },
];

export const monthlyReport: MonthlyReport = {
  month: '2026-06',
  newRisks: 128,
  closedRisks: 96,
  totalRisks: 187,
  avgResolutionDays: 5.8,
  recurrenceRate: 23.5,
  topRecurringIssues: recurringIssues,
  departmentRankings,
};

export const todoItems: TodoItem[] = [
  {
    id: 'todo-001',
    title: '整改：核心代码库公开外链风险',
    type: 'task',
    riskLevel: 'high',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    folderName: '智能客服系统 - 核心代码库',
    assignee: '张伟',
  },
  {
    id: 'todo-002',
    title: '超期：客户数据文件夹90天未复核',
    type: 'overdue',
    riskLevel: 'high',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    folderName: 'CRM系统 - 客户数据',
    assignee: '李娜',
  },
  {
    id: 'todo-003',
    title: '今日新增：市场活动资料外部账号风险',
    type: 'risk',
    riskLevel: 'medium',
    folderName: '营销活动平台 - Q2活动资料',
  },
  {
    id: 'todo-004',
    title: '整改：财务报表权限过大问题',
    type: 'task',
    riskLevel: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    folderName: '财务系统升级 - 月度报表',
    assignee: '王强',
  },
  {
    id: 'todo-005',
    title: '即将超期：HR系统权限复核',
    type: 'task',
    riskLevel: 'medium',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    folderName: '人力资源系统 - 员工档案',
    assignee: '陈静',
  },
];

export function getProjectRankings() {
  const projectMap = new Map<string, { high: number; medium: number; low: number; total: number }>();
  
  allFolders.forEach(folder => {
    const current = projectMap.get(folder.projectName) || { high: 0, medium: 0, low: 0, total: 0 };
    current[folder.riskLevel === 'high' ? 'high' : folder.riskLevel === 'medium' ? 'medium' : 'low']++;
    current.total++;
    projectMap.set(folder.projectName, current);
  });
  
  return Array.from(projectMap.entries())
    .map(([name, stats]) => ({
      id: name,
      name,
      highRiskCount: stats.high,
      mediumRiskCount: stats.medium,
      lowRiskCount: stats.low,
      totalRisk: stats.high * 3 + stats.medium * 2 + stats.low,
    }))
    .sort((a, b) => b.totalRisk - a.totalRisk)
    .slice(0, 10);
}

export function getOwnerRankings() {
  const ownerMap = new Map<string, { high: number; medium: number; low: number; total: number }>();
  
  allFolders.forEach(folder => {
    const current = ownerMap.get(folder.owner) || { high: 0, medium: 0, low: 0, total: 0 };
    current[folder.riskLevel === 'high' ? 'high' : folder.riskLevel === 'medium' ? 'medium' : 'low']++;
    current.total++;
    ownerMap.set(folder.owner, current);
  });
  
  return Array.from(ownerMap.entries())
    .map(([name, stats]) => ({
      id: name,
      name,
      highRiskCount: stats.high,
      mediumRiskCount: stats.medium,
      lowRiskCount: stats.low,
      totalRisk: stats.high * 3 + stats.medium * 2 + stats.low,
    }))
    .sort((a, b) => b.totalRisk - a.totalRisk)
    .slice(0, 10);
}
