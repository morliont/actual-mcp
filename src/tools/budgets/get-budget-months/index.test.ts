import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './index.js';
import * as actualApi from '../../../actual-api.js';

vi.mock('../../../actual-api.js', () => ({
  getBudgetMonths: vi.fn(),
}));

describe('get-budget-months tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a list of budget months successfully', async () => {
    const mockMonths = ['2024-01', '2024-02', '2024-03'];
    vi.mocked(actualApi.getBudgetMonths).mockResolvedValue(mockMonths);

    const result = await handler();

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    if (result.content[0].type === 'text') {
      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent).toEqual(mockMonths);
    }
    expect(actualApi.getBudgetMonths).toHaveBeenCalledOnce();
  });

  it('should return an empty array when no budget months exist', async () => {
    vi.mocked(actualApi.getBudgetMonths).mockResolvedValue([]);

    const result = await handler();

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    if (result.content[0].type === 'text') {
      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent).toEqual([]);
    }
  });

  it('should handle API errors gracefully', async () => {
    const error = new Error('API connection failed');
    vi.mocked(actualApi.getBudgetMonths).mockRejectedValue(error);

    const result = await handler();

    expect(result.isError).toBe(true);
    if (result.isError) {
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('API connection failed');
    }
  });
});
