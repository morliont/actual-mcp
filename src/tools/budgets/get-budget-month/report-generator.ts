import { formatAmount } from '../../../utils.js';
import type { ReportData, CategoryGroupBudgetInfo } from './types.js';

export class GetBudgetMonthReportGenerator {
  /**
   * Generate a formatted markdown report from budget data
   *
   * @param data - Report data to format
   * @returns Markdown-formatted report
   */
  generate(data: ReportData): string {
    const lines: string[] = [];

    // Header
    lines.push(`# Budget for ${data.month}\n`);

    // Summary section
    lines.push('## Summary');
    lines.push(`- **Total Budgeted**: ${formatAmount(data.summary.totalBudgeted)}`);
    lines.push(`- **Total Spent**: ${formatAmount(data.summary.totalSpent)}`);
    lines.push(`- **Total Balance**: ${formatAmount(data.summary.totalBalance)}`);
    lines.push(`- **To Budget**: ${formatAmount(data.summary.toBudget)}`);
    lines.push(`- **Income Available**: ${formatAmount(data.summary.incomeAvailable)}\n`);

    // Category groups section
    if (data.categoryGroups.length > 0) {
      lines.push('## Category Groups\n');

      for (const group of data.categoryGroups) {
        lines.push(`### ${group.name}`);
        lines.push(
          `**Group Total**: Budgeted ${formatAmount(group.totalBudgeted)} | Spent ${formatAmount(group.totalSpent)} | Balance ${formatAmount(group.totalBalance)}\n`
        );

        if (group.categories.length > 0) {
          for (const category of group.categories) {
            const budgeted = formatAmount(category.budgeted);
            const spent = formatAmount(category.spent);
            const balance = formatAmount(category.balance);
            lines.push(`- **${category.name}**: Budgeted ${budgeted} | Spent ${spent} | Balance ${balance}`);
          }
          lines.push('');
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Build report data from fetched budget and category information
   *
   * @param budgetData - Budget data from API
   * @param categories - Category list
   * @param categoryGroups - Category group list
   * @returns Structured report data
   */
  buildReportData(
    budgetData: {
      month: string;
      totalBudgeted: number;
      totalSpent: number;
      totalBalance: number;
      toBudget: number;
      incomeAvailable: number;
      categoryGroups: Record<string, unknown>[];
    },
    categories: Array<{ id: string; name: string; group_id?: string }>,
    categoryGroups: Array<{ id: string; name: string }>
  ): ReportData {
    // Build a map of category groups with their budget info
    const groupMap = new Map<string, CategoryGroupBudgetInfo>();

    // Initialize all groups
    for (const group of categoryGroups) {
      groupMap.set(group.id, {
        id: group.id,
        name: group.name,
        categories: [],
        totalBudgeted: 0,
        totalSpent: 0,
        totalBalance: 0,
      });
    }

    // Process category budget data from the API response
    for (const groupData of budgetData.categoryGroups) {
      const groupId = (groupData as { id: string }).id;
      const groupBudgetData = groupData as {
        id: string;
        categories?: Array<{
          id: string;
          budgeted?: number;
          spent?: number;
          balance?: number;
        }>;
      };

      if (!groupBudgetData.categories) continue;

      for (const catBudget of groupBudgetData.categories) {
        const category = categories.find((c) => c.id === catBudget.id);
        if (!category) continue;

        const budgeted = catBudget.budgeted || 0;
        const spent = catBudget.spent || 0;
        const balance = catBudget.balance || 0;

        const group = groupMap.get(groupId);
        if (group) {
          group.categories.push({
            id: category.id,
            name: category.name,
            budgeted,
            spent,
            balance,
          });
          group.totalBudgeted += budgeted;
          group.totalSpent += spent;
          group.totalBalance += balance;
        }
      }
    }

    return {
      month: budgetData.month,
      summary: {
        totalBudgeted: budgetData.totalBudgeted,
        totalSpent: budgetData.totalSpent,
        totalBalance: budgetData.totalBalance,
        toBudget: budgetData.toBudget,
        incomeAvailable: budgetData.incomeAvailable,
      },
      categoryGroups: Array.from(groupMap.values()).filter((g) => g.categories.length > 0),
    };
  }
}
