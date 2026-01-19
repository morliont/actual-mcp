import { describe, it, expect } from 'vitest';
import { GetBudgetMonthInputParser } from './input-parser.js';
import { ZodError } from 'zod';

describe('GetBudgetMonthInputParser', () => {
  const parser = new GetBudgetMonthInputParser();

  it('should parse valid month format YYYY-MM', () => {
    const result = parser.parse({ month: '2024-01' });

    expect(result).toEqual({
      month: '2024-01',
    });
  });

  it('should parse various valid month formats', () => {
    const validMonths = ['2024-01', '2023-12', '2025-06', '2020-11'];

    for (const month of validMonths) {
      const result = parser.parse({ month });
      expect(result.month).toBe(month);
    }
  });

  it('should throw ZodError for invalid month format', () => {
    const invalidInputs = [
      { month: '2024-1' }, // Single digit month
      { month: '24-01' }, // Two digit year
      { month: '2024/01' }, // Wrong separator
      { month: '202401' }, // Missing separator
      { month: 'January 2024' }, // Text format
    ];

    for (const input of invalidInputs) {
      expect(() => parser.parse(input)).toThrow(ZodError);
    }
  });

  it('should accept month numbers without validation', () => {
    // Note: The regex only validates format, not month value
    const result = parser.parse({ month: '2024-13' });
    expect(result.month).toBe('2024-13');
  });

  it('should throw ZodError when month is missing', () => {
    expect(() => parser.parse({} as { month: string })).toThrow(ZodError);
  });
});
