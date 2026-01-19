import { GetBudgetMonthArgsSchema, type GetBudgetMonthArgs } from '../../../types.js';
import type { ParsedInput } from './types.js';

export class GetBudgetMonthInputParser {
  /**
   * Parse and validate input arguments
   *
   * @param args - Input arguments from the tool call
   * @returns Parsed input with validated month
   */
  parse(args: GetBudgetMonthArgs): ParsedInput {
    const validated = GetBudgetMonthArgsSchema.parse(args);

    return {
      month: validated.month,
    };
  }
}
