import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './index.js';
import * as actualApi from '../../../actual-api.js';
import * as fetchCategories from '../../../core/data/fetch-categories.js';

vi.mock('../../../actual-api.js', () => ({
  getBudgetMonth: vi.fn(),
}));

vi.mock('../../../core/data/fetch-categories.js', () => ({
  fetchAllCategories: vi.fn(),
  fetchAllCategoryGroups: vi.fn(),
}));

describe('get-budget-month tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return budget data for a valid month', async () => {
    const mockBudgetData = {
      month: '2024-01',
      incomeAvailable: 500000,
      lastMonthOverspent: 0,
      forNextMonth: 0,
      totalBudgeted: 400000,
      toBudget: 100000,
      fromLastMonth: 0,
      totalIncome: 500000,
      totalSpent: 350000,
      totalBalance: 50000,
      categoryGroups: [
        {
          id: 'group1',
          categories: [
            {
              id: 'cat1',
              budgeted: 200000,
              spent: 150000,
              balance: 50000,
            },
          ],
        },
      ],
    };

    const mockCategories = [
      {
        id: 'cat1',
        name: 'Groceries',
        group_id: 'group1',
      },
    ];

    const mockCategoryGroups = [
      {
        id: 'group1',
        name: 'Food',
      },
    ];

    vi.mocked(actualApi.getBudgetMonth).mockResolvedValue(mockBudgetData);
    vi.mocked(fetchCategories.fetchAllCategories).mockResolvedValue(mockCategories);
    vi.mocked(fetchCategories.fetchAllCategoryGroups).mockResolvedValue(mockCategoryGroups);

    const result = await handler({ month: '2024-01' });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    if (result.content[0].type === 'text') {
      expect(result.content[0].text).toContain('Budget for 2024-01');
      expect(result.content[0].text).toContain('Food');
      expect(result.content[0].text).toContain('Groceries');
    }
    expect(actualApi.getBudgetMonth).toHaveBeenCalledWith('2024-01');
  });

  it('should handle invalid month format', async () => {
    const result = await handler({ month: 'invalid' });

    expect(result.isError).toBe(true);
    if (result.isError) {
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    }
  });

  it('should handle API errors gracefully', async () => {
    const error = new Error('Budget data not found');
    vi.mocked(actualApi.getBudgetMonth).mockRejectedValue(error);
    vi.mocked(fetchCategories.fetchAllCategories).mockResolvedValue([]);
    vi.mocked(fetchCategories.fetchAllCategoryGroups).mockResolvedValue([]);

    const result = await handler({ month: '2024-01' });

    expect(result.isError).toBe(true);
    if (result.isError) {
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Budget data not found');
    }
  });

  it('should handle empty category groups', async () => {
    const mockBudgetData = {
      month: '2024-01',
      incomeAvailable: 0,
      lastMonthOverspent: 0,
      forNextMonth: 0,
      totalBudgeted: 0,
      toBudget: 0,
      fromLastMonth: 0,
      totalIncome: 0,
      totalSpent: 0,
      totalBalance: 0,
      categoryGroups: [],
    };

    vi.mocked(actualApi.getBudgetMonth).mockResolvedValue(mockBudgetData);
    vi.mocked(fetchCategories.fetchAllCategories).mockResolvedValue([]);
    vi.mocked(fetchCategories.fetchAllCategoryGroups).mockResolvedValue([]);

    const result = await handler({ month: '2024-01' });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    if (result.content[0].type === 'text') {
      expect(result.content[0].text).toContain('Budget for 2024-01');
      expect(result.content[0].text).toContain('$0.00');
    }
  });
});
