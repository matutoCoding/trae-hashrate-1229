import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SharedFolder, Department, TrendDataPoint, TodoItem, RankingDimension, RankingItem, MonthlyReport, RiskReasonType } from '@/types';
import { allFolders as initialFolders } from '@/data/folders';
import { departments as initialDepartments } from '@/data/departments';
import { trendData30Days, trendData7Days, trendData90Days } from '@/data/trends';
import { todoItems as initialTodos, getProjectRankings, getOwnerRankings, monthlyReport as initialMonthlyReport } from '@/data/report';

export type TrendRiskType = 'all' | RiskReasonType;
export type TimeRange = 7 | 30 | 90;

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
  
  selectedFolderIds: string[];
  isBatchMode: boolean;
  batchAssignModalOpen: boolean;
  
  expandedDepartmentsInReport: string[];
  
  setSelectedFolder: (folder: SharedFolder | null) => void;
  setDetailDrawerOpen: (open: boolean) => void;
  setRankingDimension: (dim: RankingDimension) => void;
  setTrendRiskType: (type: TrendRiskType) => void;
  setTrendTimeRange: (range: TimeRange) => void;
  
  getDepartmentRankings: () => RankingItem[];
  getProjectRankings: () => RankingItem[];
  getOwnerRankings: () => RankingItem[];
  getCurrentRankings: () => RankingItem[];
  getTrendData: () => TrendDataPoint[];
  
  toggleFolderSelection: (folderId: string) => void;
  clearFolderSelection: () => void;
  setBatchMode: (mode: boolean) => void;
  setBatchAssignModalOpen: (open: boolean) => void;
  toggleDepartmentInReport: (deptId: string) => void;
  
  externalLinksCount: number;
  externalAccountsCount: number;
  publicEditableCount: number;
  overdueReviewCount: number;
  recomputeStats: () => void;
  
  assignTask: (folderId: string, assignee: string, dueDate: string, remark: string) => void;
  batchAssignTask: (folderIds: string[], assignee: string, dueDate: string, remark: string) => void;
  completeTask: (folderId: string) => void;
  batchCompleteTask: (folderIds: string[]) => void;
}

function calcStats(folders: SharedFolder[]) {
  return {
    externalLinksCount: folders.reduce((sum, f) => sum + f.externalLinks, 0),
    externalAccountsCount: folders.reduce((sum, f) => sum + f.externalAccounts, 0),
    publicEditableCount: folders.filter(f => f.isPublicEditable).length,
    overdueReviewCount: folders.filter(f => new Date(f.nextReviewDue) < new Date()).length,
  };
}

function generateTypedTrendData(days: number, type: TrendRiskType): TrendDataPoint[] {
  const now = new Date();
  const data: TrendDataPoint[] = [];
  let totalRisks = type === 'all' ? 156 : 40;
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    const multiplier = type === 'all' ? 1 : 0.35;
    const newRisks = Math.floor((Math.random() * 8 + 2) * multiplier);
    const closedRisks = Math.floor((Math.random() * 6 + 1) * multiplier);
    
    totalRisks = totalRisks + newRisks - closedRisks;
    const min = type === 'all' ? 100 : 20;
    const max = type === 'all' ? 200 : 80;
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
      selectedFolderIds: [],
      isBatchMode: false,
      batchAssignModalOpen: false,
      expandedDepartmentsInReport: [],
      
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
      setBatchMode: (mode) => set({ isBatchMode: mode, selectedFolderIds: [] }),
      setBatchAssignModalOpen: (open) => set({ batchAssignModalOpen: open }),
      
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
        const { trendTimeRange, trendRiskType } = get();
        return generateTypedTrendData(trendTimeRange, trendRiskType);
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
