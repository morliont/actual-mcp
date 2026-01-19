import { getCategories, getCategoryGroups } from '../../actual-api.js';
import type { Category, CategoryGroup } from '../types/domain.js';
import type { APICategoryEntity } from '@actual-app/api/@types/loot-core/src/server/api-models.js';

export async function fetchAllCategories(): Promise<Category[]> {
  const results = await getCategories();
  // Filter out category groups and return only categories
  return results.filter((item): item is APICategoryEntity => 'group_id' in item) as Category[];
}

export async function fetchAllCategoryGroups(): Promise<CategoryGroup[]> {
  return getCategoryGroups();
}
