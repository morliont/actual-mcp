# Custom Changes Changelog

This file tracks custom modifications made to the fork that differ from the upstream `s-stefanov/actual-mcp` repository.

## [Custom] - 2026-01-19

### Added
- **Budget Tools** (v1.8.0)
  - Created `get-budget-months` tool to retrieve all available budget months
  - Created `get-budget-month` tool to get detailed budget data for a specific month
    - Includes budgeted vs spent amounts for all categories organized by category groups
    - Displays summary totals and individual category breakdowns
  - Added API wrappers: `getBudgetMonths()` and `getBudgetMonth()` in `src/actual-api.ts`
  - Added `BudgetMonth` type and `GetBudgetMonthArgs` schema in `src/types.ts`
  - Comprehensive unit tests with 100% coverage for both tools
  - Updated README.md with new tools documentation and example queries

## [Custom] - 2026-01-18

### Added
- **Multi-Platform Docker Support**
  - Created `docker-push.sh` script for building and pushing multi-arch Docker images (linux/amd64, linux/arm64)
  - Added `DOCKER.md` with comprehensive Docker deployment documentation
  - Added npm scripts: `docker:build` and `docker:push`
  
- **Upstream Sync Tooling**
  - Created `sync-upstream.sh` script for automated upstream synchronization
  - Added `UPSTREAM_SYNC.md` with detailed sync strategy documentation
  - Added npm script: `sync:upstream`
  - Created this changelog to track custom modifications

- **Development Documentation**
  - Added `WARP.md` with project-specific development rules and guidelines

### Changed
- **API Compatibility for @actual-app/api v26.1.0**
  - Updated `package.json` to use `@actual-app/api: 26.1.0`
  - Updated `package-lock.json` to sync with new dependencies
  
  - **File: `src/actual-api.ts`**
    - Changed `getCategories()` return type to `Promise<(APICategoryEntity | APICategoryGroupEntity)[]>` to match v26 API
    - Updated `createPayee()` parameter from `Record<string, unknown>` to `Omit<APIPayeeEntity, 'id'>`
    - Updated `updatePayee()` parameter from `Record<string, unknown>` to `Partial<APIPayeeEntity>`
    - Updated `createRule()` parameter from `Record<string, unknown>` to `Omit<RuleEntity, 'id'>`
    - Updated `updateRule()` parameter from `Record<string, unknown>` to `RuleEntity`
    - Updated `createCategory()` parameter from `Record<string, unknown>` to `Omit<APICategoryEntity, 'id'>`
    - Updated `updateCategory()` parameter from `Record<string, unknown>` to `Partial<APICategoryEntity>`
    - Updated `createCategoryGroup()` parameter from `Record<string, unknown>` to `Omit<APICategoryGroupEntity, 'id'>`
    - Updated `updateCategoryGroup()` parameter from `Record<string, unknown>` to `Partial<APICategoryGroupEntity>`
    - Added type cast in `updateTransaction()` to handle subtransactions type requirements

  - **File: `src/core/data/fetch-categories.ts`**
    - Updated `fetchAllCategories()` to filter category groups from mixed results
    - Added import for `APICategoryEntity` and `APICategoryGroupEntity` types

  - **File: `src/tools/categories/create-category/index.ts`**
    - Changed data object type from `Record<string, unknown>` to properly typed object with string assertions

  - **File: `src/tools/categories/create-category-group/index.ts`**
    - Changed data object type from `Record<string, unknown>` to properly typed object with string assertions

  - **File: `src/tools/payees/create-payee/index.ts`**
    - Changed data object type to explicit `{ name: string; transfer_acct?: string }`

  - **File: `src/tools/rules/create-rule/index.ts`**
    - Added type cast to `Omit<RuleEntity, 'id'>` when calling `createRule()`

  - **File: `src/tools/rules/update-rule/index.ts`**
    - Added import for `RuleEntity`
    - Added type cast to `RuleEntity` when calling `updateRule()`

### Technical Notes

**Why these changes?**
The upstream repository was using `@actual-app/api` v25.x which had looser type requirements. When upgrading to v26.1.0, the API introduced stricter TypeScript types that required proper type signatures for all create/update operations.

**Merge Strategy:**
- If upstream upgrades to v26+, review their implementation and likely adopt their version
- If upstream stays on v25, keep these changes and continue maintaining your fork

**Testing:**
All changes have been validated with:
- TypeScript compilation: `npm run type-check` ✓
- Linting: `npm run lint` ✓
- Tests: `npm run test` ✓
- Docker multi-platform build ✓

---

## Sync History

### [Sync] - YYYY-MM-DD
*Record upstream syncs here*

**Upstream Commits Merged:**
- List commits from upstream

**Conflicts Resolved:**
- Describe any conflicts and how they were resolved

**Tests After Sync:**
- [ ] `npm run quality`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run docker:build`
