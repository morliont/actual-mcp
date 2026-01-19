// ----------------------------
// GET BUDGET MONTHS TOOL
// ----------------------------

import { successWithJson, errorFromCatch } from '../../../utils/response.js';
import { getBudgetMonths } from '../../../actual-api.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type ToolInput } from '../../../types.js';

// Define an empty schema with zod
const GetBudgetMonthsArgsSchema = z.object({});

export const schema = {
  name: 'get-budget-months',
  description: 'Retrieve a list of all available budget months. Returns an array of month strings in YYYY-MM format.',
  inputSchema: zodToJsonSchema(GetBudgetMonthsArgsSchema) as ToolInput,
};

export async function handler(): Promise<ReturnType<typeof successWithJson> | ReturnType<typeof errorFromCatch>> {
  try {
    const months = await getBudgetMonths();

    return successWithJson(months);
  } catch (err) {
    return errorFromCatch(err);
  }
}
