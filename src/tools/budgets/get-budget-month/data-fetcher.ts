import { getBudgetMonth } from '../../../actual-api.js';
import { fetchAllCategories, fetchAllCategoryGroups } from '../../../core/data/fetch-categories.js';
import type { FetchedData } from './types.js';

export class GetBudgetMonthDataFetcher {
  /**
   * Fetch budget data for the specified month along with category details
   *
   * @param month - Budget month in YYYY-MM format
   * @returns Budget data, categories, and category groups
   */
  async fetchAll(month: string): Promise<FetchedData> {
    const [budgetData, categories, categoryGroups] = await Promise.all([
      getBudgetMonth(month),
      fetchAllCategories(),
      fetchAllCategoryGroups(),
    ]);

    return {
      budgetData,
      categories,
      categoryGroups,
    };
  }
}
