import type { BudgetMonth, Category, CategoryGroup } from '../../../types.js';

export interface ParsedInput {
  month: string;
}

export interface FetchedData {
  budgetData: BudgetMonth;
  categories: Category[];
  categoryGroups: CategoryGroup[];
}

export interface CategoryBudgetInfo {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  balance: number;
}

export interface CategoryGroupBudgetInfo {
  id: string;
  name: string;
  categories: CategoryBudgetInfo[];
  totalBudgeted: number;
  totalSpent: number;
  totalBalance: number;
}

export interface ReportData {
  month: string;
  summary: {
    totalBudgeted: number;
    totalSpent: number;
    totalBalance: number;
    toBudget: number;
    incomeAvailable: number;
  };
  categoryGroups: CategoryGroupBudgetInfo[];
}
