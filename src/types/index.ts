export type RiskLevel = 'high' | 'medium' | 'low';

export type RemediationStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type RiskReasonType = 
  | 'external_link' 
  | 'external_account' 
  | 'public_edit' 
  | 'overdue_review' 
  | 'excessive_permission';

export interface RiskReason {
  id: string;
  type: RiskReasonType;
  description: string;
  severity: RiskLevel;
  discoveredAt: string;
}

export interface RemediationRecord {
  id: string;
  action: string;
  operator: string;
  operatedAt: string;
  remark: string;
}

export interface UrgeRecord {
  id: string;
  urgedAt: string;
  urger: string;
  remark: string;
}

export interface RescheduleRecord {
  id: string;
  oldDueDate: string;
  newDueDate: string;
  rescheduledAt: string;
  operator: string;
  remark: string;
}

export interface RemediationTask {
  id: string;
  folderId: string;
  assignee: string;
  assigneeEmail: string;
  assigner: string;
  assignedAt: string;
  dueDate: string;
  status: RemediationStatus;
  completedAt: string | null;
  remark: string;
  urgeCount: number;
  lastUrgedAt: string | null;
  urgeRecords: UrgeRecord[];
  rescheduleRecords: RescheduleRecord[];
}

export interface SharedFolder {
  id: string;
  name: string;
  path: string;
  departmentId: string;
  departmentName: string;
  projectName: string;
  owner: string;
  ownerEmail: string;
  riskLevel: RiskLevel;
  riskReasons: RiskReason[];
  externalLinks: number;
  externalAccounts: number;
  isPublicEditable: boolean;
  firstDiscoveredAt: string;
  lastReviewedAt: string | null;
  nextReviewDue: string;
  remediationHistory: RemediationRecord[];
  currentTask: RemediationTask | null;
}

export interface Department {
  id: string;
  name: string;
  totalFolders: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  overdueCount: number;
  remediationRate: number;
}

export interface TrendDataPoint {
  date: string;
  newRisks: number;
  closedRisks: number;
  totalRisks: number;
}

export interface RecurringIssue {
  id: string;
  description: string;
  occurrenceCount: number;
  lastOccurrence: string;
  affectedDepartments: string[];
}

export interface DepartmentRanking {
  departmentId: string;
  departmentName: string;
  score: number;
  improvement: number;
}

export interface MonthlyReport {
  month: string;
  newRisks: number;
  closedRisks: number;
  totalRisks: number;
  avgResolutionDays: number;
  recurrenceRate: number;
  topRecurringIssues: RecurringIssue[];
  departmentRankings: DepartmentRanking[];
}

export interface TodoItem {
  id: string;
  title: string;
  type: 'task' | 'risk' | 'overdue';
  riskLevel?: RiskLevel;
  dueDate?: string;
  folderName: string;
  assignee?: string;
}

export type RankingDimension = 'department' | 'project' | 'owner';

export interface RankingItem {
  id: string;
  name: string;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalRisk: number;
}
