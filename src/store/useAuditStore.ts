import { create } from 'zustand';
import type { SharedFolder, Department, TrendDataPoint, TodoItem, RankingDimension, RankingItem, MonthlyReport } from '@/types';
import { allFolders, getFoldersByDepartment, getTotalExternalLinks, getTotalExternalAccounts, getPublicEditableCount, getOverdueReviewCount } from '@/data/folders';
import { departments } from '@/data/departments';
import { trendData30Days } from '@/data/trends';
import { todoItems, getProjectRankings, getOwnerRankings, monthlyReport } from '@/data/report';

interface AuditState {
  folders: SharedFolder[];
  departments: Department[];
  trendData: TrendDataPoint[];
  todos: TodoItem[];
  monthlyReport: MonthlyReport;
  selectedFolder: SharedFolder | null;
  isDetailDrawerOpen: boolean;
  selectedDepartmentId: string | null;
  rankingDimension: RankingDimension;
  
  setSelectedFolder: (folder: SharedFolder | null) => void;
  setDetailDrawerOpen: (open: boolean) => void;
  setSelectedDepartmentId: (id: string | null) => void;
  setRankingDimension: (dim: RankingDimension) => void;
  getDepartmentRankings: () => RankingItem[];
  getProjectRankings: () => RankingItem[];
  getOwnerRankings: () => RankingItem[];
  getCurrentRankings: () => RankingItem[];
  
  externalLinksCount: number;
  externalAccountsCount: number;
  publicEditableCount: number;
  overdueReviewCount: number;
  
  assignTask: (folderId: string, assignee: string, dueDate: string, remark: string) => void;
  completeTask: (folderId: string) => void;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  folders: allFolders,
  departments,
  trendData: trendData30Days,
  todos: todoItems,
  monthlyReport,
  selectedFolder: null,
  isDetailDrawerOpen: false,
  selectedDepartmentId: null,
  rankingDimension: 'department',
  
  externalLinksCount: getTotalExternalLinks(),
  externalAccountsCount: getTotalExternalAccounts(),
  publicEditableCount: getPublicEditableCount(),
  overdueReviewCount: getOverdueReviewCount(),
  
  setSelectedFolder: (folder) => set({ selectedFolder: folder }),
  setDetailDrawerOpen: (open) => set({ isDetailDrawerOpen: open }),
  setSelectedDepartmentId: (id) => set({ selectedDepartmentId: id }),
  setRankingDimension: (dim) => set({ rankingDimension: dim }),
  
  getDepartmentRankings: () => {
    const { departments } = get();
    return departments
      .map(d => ({
        id: d.id,
        name: d.name,
        highRiskCount: d.highRiskCount,
        mediumRiskCount: d.mediumRiskCount,
        lowRiskCount: d.lowRiskCount,
        totalRisk: d.highRiskCount * 3 + d.mediumRiskCount * 2 + d.lowRiskCount,
      }))
      .sort((a, b) => b.totalRisk - a.totalRisk);
  },
  
  getProjectRankings: () => getProjectRankings(),
  getOwnerRankings: () => getOwnerRankings(),
  
  getCurrentRankings: () => {
    const { rankingDimension, getDepartmentRankings, getProjectRankings, getOwnerRankings } = get();
    switch (rankingDimension) {
      case 'department': return getDepartmentRankings();
      case 'project': return getProjectRankings();
      case 'owner': return getOwnerRankings();
      default: return getDepartmentRankings();
    }
  },
  
  assignTask: (folderId, assignee, dueDate, remark) => {
    set(state => ({
      folders: state.folders.map(f => {
        if (f.id !== folderId) return f;
        const newTask = {
          id: `task-${Date.now()}`,
          folderId,
          assignee,
          assigneeEmail: `${assignee}@company.com`,
          assigner: '当前用户',
          assignedAt: new Date().toISOString(),
          dueDate,
          status: 'pending' as const,
          completedAt: null,
          remark,
        };
        return { ...f, currentTask: newTask };
      }),
    }));
  },
  
  completeTask: (folderId) => {
    set(state => ({
      folders: state.folders.map(f => {
        if (f.id !== folderId || !f.currentTask) return f;
        return {
          ...f,
          currentTask: {
            ...f.currentTask,
            status: 'completed',
            completedAt: new Date().toISOString(),
          },
          remediationHistory: [
            ...f.remediationHistory,
            {
              id: `record-${Date.now()}`,
              action: '整改完成',
              operator: f.currentTask.assignee,
              operatedAt: new Date().toISOString(),
              remark: '已完成权限整改',
            },
          ],
        };
      }),
    }));
  },
}));
