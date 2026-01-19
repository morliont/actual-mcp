import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { GetBudgetMonthInputParser } from './input-parser.js';
import { GetBudgetMonthDataFetcher } from './data-fetcher.js';
import { GetBudgetMonthReportGenerator } from './report-generator.js';
import { successWithContent, errorFromCatch } from '../../../utils/response.js';
import { GetBudgetMonthArgsSchema, type GetBudgetMonthArgs, ToolInput } from '../../../types.js';

export const schema = {
  name: 'get-budget-month',
  description:
    'Get detailed budget information for a specific month, including budgeted amounts, spent amounts, and balances for all categories organized by category groups.',
  inputSchema: zodToJsonSchema(GetBudgetMonthArgsSchema) as ToolInput,
};

export async function handler(args: GetBudgetMonthArgs): Promise<CallToolResult> {
  try {
    const input = new GetBudgetMonthInputParser().parse(args);

    const { budgetData, categories, categoryGroups } = await new GetBudgetMonthDataFetcher().fetchAll(input.month);

    const reportGenerator = new GetBudgetMonthReportGenerator();
    const reportData = reportGenerator.buildReportData(budgetData, categories, categoryGroups);
    const markdown = reportGenerator.generate(reportData);

    return successWithContent({ type: 'text', text: markdown });
  } catch (err) {
    return errorFromCatch(err);
  }
}
