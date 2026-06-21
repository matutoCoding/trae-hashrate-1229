import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SharedFolder, Department, TrendDataPoint, TodoItem, RankingDimension, RankingItem, MonthlyReport, RiskReasonType } from '@/types';
import { allFolders as initialFolders } from '@/data/folders';
import { departments as initialDepartments } from '@/data/departments';
import { trendData30Days, trendData7Days, trendData90Days } from '@/data/trends';
import { todoItems as initialTodos, getProjectRankings, getOwnerRankings, monthlyReport as initialMonthlyReport } from '@/data/report';

export type TrendRiskType = 'all' | RiskReasonType;
export type TimeRange = 7 | 30 | 90;
export type MeetingIssueFilter = 'new' | 'closed' | 'overdue' | 'recurring';

interface AuditState {
  folders: SharedFolder[];
  departments: Department[];
  todos: TodoItem[];
  monthlyReport: MonthlyReport;
  selectedFolder: SharedFolder | null;
  isDetailDrawerOpen: boolean;
  rankingDimension: RankingDimension;
  
  trendRiskType: TrendRiskType;
  trendTimeRange: TimeRange;
  trendDepartmentId: string | 'all';
  
  selectedFolderIds: string[];
  isBatchMode: boolean;
  batchAssignModalOpen: boolean;
  batchRescheduleModalOpen: boolean;
  
  expandedDepartmentsInReport: string[];
  meetingIssueFilterByDept: Record<string, MeetingIssueFilter>;
  
  setSelectedFolder: (folder: SharedFolder | null) => void;
  setDetailDrawerOpen: (open: boolean) => void;
  setRankingDimension: (dim: RankingDimension) => void;
  setTrendRiskType: (type: TrendRiskType) => void;
  setTrendTimeRange: (range: TimeRange) => void;
  setTrendDepartmentId: (deptId: string | 'all') => void;
  
  getDepartmentRankings: () => RankingItem[];
  getProjectRankings: () => RankingItem[];
  getOwnerRankings: () => RankingItem[];
  getCurrentRankings: () => RankingItem[];
  getTrendData: () => TrendDataPoint[];
  getFilteredFolders: () => SharedFolder[];
  getFilteredStats: () => { externalLinksCount: number; externalAccountsCount: number; publicEditableCount: number; overdueReviewCount: number };
  
  toggleFolderSelection: (folderId: string) => void;
  clearFolderSelection: () => void;
  setBatchMode: (mode: boolean) => void;
  setBatchAssignModalOpen: (open: boolean) => void;
  setBatchRescheduleModalOpen: (open: boolean) => void;
  toggleDepartmentInReport: (deptId: string) => void;
  setMeetingIssueFilter: (deptId: string, filter: MeetingIssueFilter) => void;
  
  externalLinksCount: number;
  externalAccountsCount: number;
  publicEditableCount: number;
  overdueReviewCount: number;
  recomputeStats: () => void;
  
  assignTask: (folderId: string, assignee: string, dueDate: string, remark: string) => void;
  batchAssignTask: (folderIds: string[], assignee: string, dueDate: string, remark: string) => void;
  completeTask: (folderId: string) => void;
  batchCompleteTask: (folderIds: string[]) => void;
  
  urgeTask: (folderId: string, remark: string) => void;
  batchUrgeTask: (folderIds: string[], remark: string) => void;
  rescheduleTask: (folderId: string, newDueDate: string, remark: string) => void;
  batchRescheduleTask: (folderIds: string[], newDueDate: string, remark: string) => void;
}

function calcStats(folders: SharedFolder[]) {
  return {
    externalLinksCount: folders.reduce((sum, f) => sum + f.externalLinks, 0),
    externalAccountsCount: folders.reduce((sum, f) => sum + f.externalAccounts, 0),
    publicEditableCount: folders.filter(f => f.isPublicEditable).length,
    overdueReviewCount: folders.filter(f => new Date(f.nextReviewDue) < new Date()).length,
  };
}

function generateTypedTrendData(days: number, type: TrendRiskType, deptId: string | 'all'): TrendDataPoint[] {
  const now = new Date();
  const data: TrendDataPoint[] = [];
  const deptMultiplier = deptId === 'all' ? 1 : 0.25;
  const typeMultiplier = type === 'all' ? 1 : 0.35;
  const multiplier = deptMultiplier * typeMultiplier;
  let totalRisks = Math.floor((type === 'all' ? 156 : 40) * deptMultiplier);
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    const newRisks = Math.floor((Math.random() * 8 + 2) * multiplier);
    const closedRisks = Math.floor((Math.random() * 6 + 1) * multiplier);
    
    totalRisks = totalRisks + newRisks - closedRisks;
    const min = Math.floor((type === 'all' ? 100 : 20) * deptMultiplier);
    const max = Math.floor((type === 'all' ? 200 : 80) * deptMultiplier);
    if (totalRisks < min) totalRisks = min;
    if (totalRisks > max) totalRisks = max;
    
    data.push({
      date: d.toISOString().split('T')[0],
      newRisks,
      closedRisks,
      totalRisks,
    });
  }
  
  return data;
}

function filterFoldersByDeptAndType(folders: SharedFolder[], deptId: string | 'all', type: TrendRiskType): SharedFolder[] {
  return folders.filter(f => {
    if (deptId !== 'all' && f.departmentId !== deptId) return false;
    if (type === 'all') return true;
    return f.riskReasons.some(r => r.type === type);
  });
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      folders: initialFolders,
      departments: initialDepartments,
      todos: initialTodos,
      monthlyReport: initialMonthlyReport,
      selectedFolder: null,
      isDetailDrawerOpen: false,
      rankingDimension: 'department',
      trendRiskType: 'all',
      trendTimeRange: 30,
      trendDepartmentId: 'all',
      selectedFolderIds: [],
      isBatchMode: false,
      batchAssignModalOpen: false,
      batchRescheduleModalOpen: false,
      expandedDepartmentsInReport: [],
      meetingIssueFilterByDept: {},
      
      ...calcStats(initialFolders),
      
      recomputeStats: () => {
        const stats = calcStats(get().folders);
        set(stats);
      },
      
      setSelectedFolder: (folder) => {
        if (folder) {
          const freshFolder = get().folders.find(f => f.id === folder.id) || folder;
          set({ selectedFolder: freshFolder });
        } else {
          set({ selectedFolder: null });
        }
      },
      
      setDetailDrawerOpen: (open) => set({ isDetailDrawerOpen: open }),
      setRankingDimension: (dim) => set({ rankingDimension: dim }),
      setTrendRiskType: (type) => set({ trendRiskType: type }),
      setTrendTimeRange: (range) => set({ trendTimeRange: range }),
      setTrendDepartmentId: (deptId) => set({ trendDepartmentId: deptId }),
      setBatchMode: (mode) => set({ isBatchMode: mode, selectedFolderIds: [] }),
      setBatchAssignModalOpen: (open) => set({ batchAssignModalOpen: open }),
      setBatchRescheduleModalOpen: (open) => set({ batchRescheduleModalOpen: open }),
      setMeetingIssueFilter: (deptId, filter) => set(state => ({
        meetingIssueFilterByDept: { ...state.meetingIssueFilterByDept, [deptId]: filter },
      })),
      
      toggleDepartmentInReport: (deptId) => {
        set(state => ({
          expandedDepartmentsInReport: state.expandedDepartmentsInReport.includes(deptId)
            ? state.expandedDepartmentsInReport.filter(id => id !== deptId)
            : [...state.expandedDepartmentsInReport, deptId],
        }));
      },
      
      toggleFolderSelection: (folderId) => {
        set(state => ({
          selectedFolderIds: state.selectedFolderIds.includes(folderId)
            ? state.selectedFolderIds.filter(id => id !== folderId)
            : [...state.selectedFolderIds, folderId],
        }));
      },
      
      clearFolderSelection: () => set({ selectedFolderIds: [] }),
      
      getDepartmentRankings: () => {
        const { departments, folders } = get();
        return departments
          .map(d => {
            const deptFolders = folders.filter(f => f.departmentId === d.id);
            const high = deptFolders.filter(f => f.riskLevel === 'high').length;
            const medium = deptFolders.filter(f => f.riskLevel === 'medium').length;
            const low = deptFolders.filter(f => f.riskLevel === 'low').length;
            return {
              id: d.id,
              name: d.name,
              highRiskCount: high,
              mediumRiskCount: medium,
              lowRiskCount: low,
              totalRisk: high * 3 + medium * 2 + low,
            };
          })
          .sort((a, b) => b.totalRisk - a.totalRisk);
      },
      
      getProjectRankings: () => {
        const { folders } = get();
        const projectMap = new Map<string, { high: number; medium: number; low: number; total: number }>();
        
        folders.forEach(folder => {
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
      },
      
      getOwnerRankings: () => {
        const { folders } = get();
        const ownerMap = new Map<string, { high: number; medium: number; low: number; total: number }>();
        
        folders.forEach(folder => {
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
      },
      
      getCurrentRankings: () => {
        const { rankingDimension, getDepartmentRankings, getProjectRankings, getOwnerRankings } = get();
        switch (rankingDimension) {
          case 'department': return getDepartmentRankings();
          case 'project': return getProjectRankings();
          case 'owner': return getOwnerRankings();
          default: return getDepartmentRankings();
        }
      },
      
      getTrendData: () => {
        const { trendTimeRange, trendRiskType, trendDepartmentId } = get();
        return generateTypedTrendData(trendTimeRange, trendRiskType, trendDepartmentId);
      },

      getFilteredFolders: () => {
        const { folders, trendRiskType, trendDepartmentId } = get();
        return filterFoldersByDeptAndType(folders, trendDepartmentId, trendRiskType);
      },

      getFilteredStats: () => {
        const filtered = get().getFilteredFolders();
        return calcStats(filtered);
      },
      
      assignTask: (folderId, assignee, dueDate, remark) => {
        const now = new Date().toISOString();
        const newTask = {
          id: `task-${Date.now()}`,
          folderId,
          assignee,
          assigneeEmail: `${assignee}@company.com`,
          assigner: '安全管理员',
          assignedAt: now,
          dueDate: new Date(dueDate).toISOString(),
          status: 'pending' as const,
          completedAt: null,
          remark,
          urgeCount: 0,
          lastUrgedAt: null,
          urgeRecords: [],
          rescheduleRecords: [],
        };
        const newRecord = {
          id: `record-${Date.now()}`,
          action: '分配整改任务',
          operator: '安全管理员',
          operatedAt: now,
          remark: `分配给 ${assignee}，截止日期 ${dueDate}${remark ? '：' + remark : ''}`,
        };
        
        set(state => {
          const updatedFolders = state.folders.map(f => {
            if (f.id !== folderId) return f;
            return {
              ...f,
              currentTask: newTask,
              remediationHistory: [...f.remediationHistory, newRecord],
            };
          });
          
          const updatedFolder = updatedFolders.find(f => f.id === folderId) || null;
          const stats = calcStats(updatedFolders);
          
          return {
            folders: updatedFolders,
            selectedFolder: state.selectedFolder?.id === folderId ? updatedFolder : state.selectedFolder,
            ...stats,
          };
        });
      },
      
      batchAssignTask: (folderIds, assignee, dueDate, remark) => {
        const now = new Date().toISOString();
        
        set(state => {
          const updatedFolders = state.folders.map(f => {
            if (!folderIds.includes(f.id)) return f;
            const newTask = {
              id: `task-${Date.now()}-${f.id}`,
              folderId: f.id,
              assignee,
              assigneeEmail: `${assignee}@company.com`,
              assigner: '安全管理员',
              assignedAt: now,
              dueDate: new Date(dueDate).toISOString(),
              status: 'pending' as const,
              completedAt: null,
              remark,
              urgeCount: 0,
              lastUrgedAt: null,
              urgeRecords: [],
              rescheduleRecords: [],
            };
            const newRecord = {
              id: `record-${Date.now()}-${f.id}`,
              action: '批量分配整改任务',
              operator: '安全管理员',
              operatedAt: now,
              remark: `分配给 ${assignee}，截止日期 ${dueDate}${remark ? '：' + remark : ''}`,
            };
            return {
              ...f,
              currentTask: newTask,
              remediationHistory: [...f.remediationHistory, newRecord],
            };
          });
          
          const stats = calcStats(updatedFolders);
          let updatedSelected = state.selectedFolder;
          if (updatedSelected && folderIds.includes(updatedSelected.id)) {
            updatedSelected = updatedFolders.find(f => f.id === updatedSelected.id) || null;
          }
          
          return {
            folders: updatedFolders,
            selectedFolder: updatedSelected,
            selectedFolderIds: [],
            isBatchMode: false,
            batchAssignModalOpen: false,
            ...stats,
          };
        });
      },
      
      completeTask: (folderId) => {
        const now = new Date().toISOString();
        
        set(state => {
          const updatedFolders = state.folders.map(f => {
            if (f.id !== folderId || !f.currentTask) return f;
            const newRecord = {
              id: `record-${Date.now()}`,
              action: '整改完成',
              operator: f.currentTask.assignee,
              operatedAt: now,
              remark: '已完成权限整改并通过复核',
            };
            return {
              ...f,
              currentTask: {
                ...f.currentTask,
                status: 'completed' as const,
                completedAt: now,
              },
              remediationHistory: [...f.remediationHistory, newRecord],
            };
          });
          
          const updatedFolder = updatedFolders.find(f => f.id === folderId) || null;
          const stats = calcStats(updatedFolders);
          
          return {
            folders: updatedFolders,
            selectedFolder: state.selectedFolder?.id === folderId ? updatedFolder : state.selectedFolder,
            ...stats,
          };
        });
      },
      
      batchCompleteTask: (folderIds) => {
        const now = new Date().toISOString();
        
        set(state => {
          const updatedFolders = state.folders.map(f => {
            if (!folderIds.includes(f.id) || !f.currentTask) return f;
            const newRecord = {
              id: `record-${Date.now()}-${f.id}`,
              action: '批量整改完成',
              operator: f.currentTask.assignee,
              operatedAt: now,
              remark: '已完成权限整改并通过复核',
            };
            return {
              ...f,
              currentTask: {
                ...f.currentTask,
                status: 'completed' as const,
                completedAt: now,
              },
              remediationHistory: [...f.remediationHistory, newRecord],
            };
          });
          
          const stats = calcStats(updatedFolders);
          let updatedSelected = state.selectedFolder;
          if (updatedSelected && folderIds.includes(updatedSelected.id)) {
            updatedSelected = updatedFolders.find(f => f.id === updatedSelected.id) || null;
          }
          
          return {
            folders: updatedFolders,
            selectedFolder: updatedSelected,
            selectedFolderIds: [],
            isBatchMode: false,
            ...stats,
          };
        });
      },
      
      urgeTask: (folderId, remark) => {
        const now = new Date().toISOString();
        const urgeRecord = {
          id: `urge-${Date.now()}`,
          urgedAt: now,
          urger: '安全管理员',
          remark: remark || '请尽快完成整改任务',
        };
        
        set(state => {
          const updatedFolders = state.folders.map(f => {
            if (f.id !== folderId || !f.currentTask) return f;
            const newRecord = {
              id: `record-${Date.now()}`,
              action: '催办整改',
              operator: '安全管理员',
              operatedAt: now,
              remark: urgeRecord.remark,
            };
            return {
              ...f,
              currentTask: {
                ...f.currentTask,
                urgeCount: f.currentTask.urgeCount + 1,
                lastUrgedAt: now,
                urgeRecords: [...f.currentTask.urgeRecords, urgeRecord],
              },
              remediationHistory: [...f.remediationHistory, newRecord],
            };
          });
          
          const updatedFolder = updatedFolders.find(f => f.id === folderId) || null;
          
          return {
            folders: updatedFolders,
            selectedFolder: state.selectedFolder?.id === folderId ? updatedFolder : state.selectedFolder,
          };
        });
      },
      
      batchUrgeTask: (folderIds, remark) => {
        const now = new Date().toISOString();
        
        set(state => {
          const updatedFolders = state.folders.map(f => {
            if (!folderIds.includes(f.id) || !f.currentTask) return f;
            const urgeRecord = {
              id: `urge-${Date.now()}-${f.id}`,
              urgedAt: now,
              urger: '安全管理员',
              remark: remark || '请尽快完成整改任务',
            };
            const newRecord = {
              id: `record-${Date.now()}-${f.id}`,
              action: '批量催办整改',
              operator: '安全管理员',
              operatedAt: now,
              remark: urgeRecord.remark,
            };
            return {
              ...f,
              currentTask: {
                ...f.currentTask,
                urgeCount: f.currentTask.urgeCount + 1,
                lastUrgedAt: now,
                urgeRecords: [...f.currentTask.urgeRecords, urgeRecord],
              },
              remediationHistory: [...f.remediationHistory, newRecord],
            };
          });
          
          let updatedSelected = state.selectedFolder;
          if (updatedSelected && folderIds.includes(updatedSelected.id)) {
            updatedSelected = updatedFolders.find(f => f.id === updatedSelected.id) || null;
          }
          
          return {
            folders: updatedFolders,
            selectedFolder: updatedSelected,
            selectedFolderIds: [],
            isBatchMode: false,
          };
        });
      },
      
      rescheduleTask: (folderId, newDueDate, remark) => {
        const now = new Date().toISOString();
        
        set(state => {
          const updatedFolders = state.folders.map(f => {
            if (f.id !== folderId || !f.currentTask) return f;
            const rescheduleRecord = {
              id: `reschedule-${Date.now()}`,
              oldDueDate: f.currentTask.dueDate,
              newDueDate: new Date(newDueDate).toISOString(),
              rescheduledAt: now,
              operator: '安全管理员',
              remark: remark || '调整整改截止日期',
            };
            const newRecord = {
              id: `record-${Date.now()}`,
              action: '调整整改截止日',
              operator: '安全管理员',
              operatedAt: now,
              remark: `从 ${f.currentTask.dueDate.split('T')[0]} 调整为 ${newDueDate}${remark ? '：' + remark : ''}`,
            };
            return {
              ...f,
              currentTask: {
                ...f.currentTask,
                dueDate: new Date(newDueDate).toISOString(),
                rescheduleRecords: [...f.currentTask.rescheduleRecords, rescheduleRecord],
              },
              remediationHistory: [...f.remediationHistory, newRecord],
            };
          });
          
          const updatedFolder = updatedFolders.find(f => f.id === folderId) || null;
          
          return {
            folders: updatedFolders,
            selectedFolder: state.selectedFolder?.id === folderId ? updatedFolder : state.selectedFolder,
          };
        });
      },
      
      batchRescheduleTask: (folderIds, newDueDate, remark) => {
        const now = new Date().toISOString();
        
        set(state => {
          const updatedFolders = state.folders.map(f => {
            if (!folderIds.includes(f.id) || !f.currentTask) return f;
            const rescheduleRecord = {
              id: `reschedule-${Date.now()}-${f.id}`,
              oldDueDate: f.currentTask.dueDate,
              newDueDate: new Date(newDueDate).toISOString(),
              rescheduledAt: now,
              operator: '安全管理员',
              remark: remark || '调整整改截止日期',
            };
            const newRecord = {
              id: `record-${Date.now()}-${f.id}`,
              action: '批量调整整改截止日',
              operator: '安全管理员',
              operatedAt: now,
              remark: `从 ${f.currentTask.dueDate.split('T')[0]} 调整为 ${newDueDate}${remark ? '：' + remark : ''}`,
            };
            return {
              ...f,
              currentTask: {
                ...f.currentTask,
                dueDate: new Date(newDueDate).toISOString(),
                rescheduleRecords: [...f.currentTask.rescheduleRecords, rescheduleRecord],
              },
              remediationHistory: [...f.remediationHistory, newRecord],
            };
          });
          
          let updatedSelected = state.selectedFolder;
          if (updatedSelected && folderIds.includes(updatedSelected.id)) {
            updatedSelected = updatedFolders.find(f => f.id === updatedSelected.id) || null;
          }
          
          return {
            folders: updatedFolders,
            selectedFolder: updatedSelected,
            selectedFolderIds: [],
            isBatchMode: false,
            batchRescheduleModalOpen: false,
          };
        });
      },
    }),
    {
      name: 'permission-audit-store',
      partialize: (state) => ({
        folders: state.folders,
        todos: state.todos,
      }),
    }
  )
);
