import type { SharedFolder, RiskReason, RemediationRecord, RemediationTask } from '@/types';

const now = new Date();

function daysAgo(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function daysLater(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const riskReasonsPool: RiskReason[] = [
  {
    id: 'rr-001',
    type: 'external_link',
    description: '存在公开外链，任何人可通过链接访问',
    severity: 'high',
    discoveredAt: daysAgo(15),
  },
  {
    id: 'rr-002',
    type: 'external_account',
    description: '共享给外部邮箱账号，存在数据泄露风险',
    severity: 'high',
    discoveredAt: daysAgo(10),
  },
  {
    id: 'rr-003',
    type: 'public_edit',
    description: '设置为公开可编辑，外部人员可修改内容',
    severity: 'high',
    discoveredAt: daysAgo(20),
  },
  {
    id: 'rr-004',
    type: 'overdue_review',
    description: '超过90天未进行权限复核',
    severity: 'medium',
    discoveredAt: daysAgo(5),
  },
  {
    id: 'rr-005',
    type: 'excessive_permission',
    description: '部门全员拥有管理权限，权限范围过大',
    severity: 'medium',
    discoveredAt: daysAgo(8),
  },
  {
    id: 'rr-006',
    type: 'external_link',
    description: '外链未设置访问密码',
    severity: 'medium',
    discoveredAt: daysAgo(12),
  },
  {
    id: 'rr-007',
    type: 'overdue_review',
    description: '超过180天未进行权限复核',
    severity: 'high',
    discoveredAt: daysAgo(3),
  },
  {
    id: 'rr-008',
    type: 'external_account',
    description: '包含已离职员工账号',
    severity: 'low',
    discoveredAt: daysAgo(7),
  },
];

const remediationHistoryPool: RemediationRecord[] = [
  {
    id: 'rh-001',
    action: '发现风险',
    operator: '系统扫描',
    operatedAt: daysAgo(30),
    remark: '初次扫描发现权限异常',
  },
  {
    id: 'rh-002',
    action: '分配整改',
    operator: '张明（安全管理员）',
    operatedAt: daysAgo(25),
    remark: '请尽快核实并调整权限',
  },
  {
    id: 'rh-003',
    action: '部分整改',
    operator: '李华',
    operatedAt: daysAgo(18),
    remark: '已移除2个外部账号，剩余账号待确认',
  },
  {
    id: 'rh-004',
    action: '复核通过',
    operator: '张明（安全管理员）',
    operatedAt: daysAgo(10),
    remark: '整改基本完成，剩余风险需持续关注',
  },
];

function createTask(status: 'pending' | 'in_progress' | 'completed' | 'overdue', dueDays: number): RemediationTask {
  const base: RemediationTask = {
    id: `task-${Math.random().toString(36).slice(2, 9)}`,
    folderId: '',
    assignee: '',
    assigneeEmail: '',
    assigner: '张明（安全管理员）',
    assignedAt: daysAgo(5),
    dueDate: daysLater(dueDays),
    status,
    completedAt: null,
    remark: '请在截止日期前完成权限整改',
  };
  
  if (status === 'completed') {
    base.completedAt = daysAgo(2);
  }
  
  return base;
}

const owners = [
  { name: '张伟', email: 'zhangwei@company.com' },
  { name: '李娜', email: 'lina@company.com' },
  { name: '王强', email: 'wangqiang@company.com' },
  { name: '刘洋', email: 'liuyang@company.com' },
  { name: '陈静', email: 'chenjing@company.com' },
  { name: '杨帆', email: 'yangfan@company.com' },
  { name: '赵敏', email: 'zhaomin@company.com' },
  { name: '周杰', email: 'zhoujie@company.com' },
];

const projects = [
  '智能客服系统', '移动APP重构', '数据中台建设', '用户增长项目',
  '财务系统升级', 'CRM系统', '供应链管理', '营销活动平台',
  '人力资源系统', '安全合规项目', '产品设计平台', '研发效能提升',
];

function generateFoldersForDept(deptId: string, deptName: string, count: number): SharedFolder[] {
  const folders: SharedFolder[] = [];
  
  for (let i = 0; i < count; i++) {
    const riskCount = Math.floor(Math.random() * 4) + 1;
    const shuffledReasons = [...riskReasonsPool].sort(() => Math.random() - 0.5);
    const selectedReasons = shuffledReasons.slice(0, riskCount);
    
    const hasHighRisk = selectedReasons.some(r => r.severity === 'high');
    const hasMediumRisk = selectedReasons.some(r => r.severity === 'medium');
    const riskLevel: 'high' | 'medium' | 'low' = hasHighRisk ? 'high' : hasMediumRisk ? 'medium' : 'low';
    
    const owner = owners[Math.floor(Math.random() * owners.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    
    const folderName = `${project}${i > 0 ? ` - 版本${i + 1}` : ''}`;
    
    const historyCount = Math.floor(Math.random() * 3) + 1;
    const history = remediationHistoryPool.slice(0, historyCount).map((h, idx) => ({
      ...h,
      id: `${h.id}-${deptId}-${i}-${idx}`,
      operatedAt: daysAgo(30 - idx * 7),
    }));
    
    const hasTask = Math.random() > 0.3;
    let currentTask: RemediationTask | null = null;
    
    if (hasTask) {
      const taskStatuses: Array<'pending' | 'in_progress' | 'completed' | 'overdue'> = ['pending', 'in_progress', 'completed', 'overdue'];
      const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
      const dueDays = status === 'overdue' ? -Math.floor(Math.random() * 10) - 1 : Math.floor(Math.random() * 14) + 1;
      currentTask = {
        ...createTask(status, dueDays),
        folderId: `folder-${deptId}-${i}`,
        assignee: owner.name,
        assigneeEmail: owner.email,
      };
    }
    
    const isOverdue = Math.random() > 0.6;
    const reviewDueDays = isOverdue ? -Math.floor(Math.random() * 60) - 1 : Math.floor(Math.random() * 90) + 1;
    
    folders.push({
      id: `folder-${deptId}-${i}`,
      name: folderName,
      path: `/${deptName}/${project}/${folderName}`,
      departmentId: deptId,
      departmentName: deptName,
      projectName: project,
      owner: owner.name,
      ownerEmail: owner.email,
      riskLevel,
      riskReasons: selectedReasons.map((r, idx) => ({
        ...r,
        id: `${r.id}-${deptId}-${i}-${idx}`,
      })),
      externalLinks: selectedReasons.filter(r => r.type === 'external_link').length * (Math.floor(Math.random() * 3) + 1),
      externalAccounts: selectedReasons.filter(r => r.type === 'external_account').length * (Math.floor(Math.random() * 5) + 1),
      isPublicEditable: selectedReasons.some(r => r.type === 'public_edit'),
      firstDiscoveredAt: daysAgo(30 + Math.floor(Math.random() * 60)),
      lastReviewedAt: Math.random() > 0.4 ? daysAgo(30 + Math.floor(Math.random() * 150)) : null,
      nextReviewDue: daysLater(reviewDueDays),
      remediationHistory: history,
      currentTask,
    });
  }
  
  return folders;
}

export const allFolders: SharedFolder[] = [
  ...generateFoldersForDept('dept-001', '研发中心', 24),
  ...generateFoldersForDept('dept-002', '市场部', 15),
  ...generateFoldersForDept('dept-003', '财务部', 10),
  ...generateFoldersForDept('dept-004', '人力资源部', 8),
  ...generateFoldersForDept('dept-005', '运营部', 18),
  ...generateFoldersForDept('dept-006', '产品部', 12),
  ...generateFoldersForDept('dept-007', '销售部', 20),
  ...generateFoldersForDept('dept-008', '法务部', 6),
];

export function getFoldersByDepartment(departmentId: string): SharedFolder[] {
  return allFolders.filter(f => f.departmentId === departmentId);
}

export function getFolderById(id: string): SharedFolder | undefined {
  return allFolders.find(f => f.id === id);
}

export function getHighRiskFolders(): SharedFolder[] {
  return allFolders.filter(f => f.riskLevel === 'high');
}

export function getOverdueFolders(): SharedFolder[] {
  const now = new Date();
  return allFolders.filter(f => new Date(f.nextReviewDue) < now);
}

export function getTotalExternalLinks(): number {
  return allFolders.reduce((sum, f) => sum + f.externalLinks, 0);
}

export function getTotalExternalAccounts(): number {
  return allFolders.reduce((sum, f) => sum + f.externalAccounts, 0);
}

export function getPublicEditableCount(): number {
  return allFolders.filter(f => f.isPublicEditable).length;
}

export function getOverdueReviewCount(): number {
  const now = new Date();
  return allFolders.filter(f => new Date(f.nextReviewDue) < now).length;
}
