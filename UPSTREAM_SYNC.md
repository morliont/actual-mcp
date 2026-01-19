# Upstream Sync Strategy

This document explains how to keep your fork in sync with the upstream `s-stefanov/actual-mcp` repository while preserving your custom changes.

## Setup (One-Time)

### 1. Fork the Repository on GitHub

If you haven't already, fork `s-stefanov/actual-mcp` to your own GitHub account (`tmorlion/actual-mcp`).

### 2. Configure Git Remotes

```bash
# Add upstream remote (if not already added)
git remote add upstream https://github.com/s-stefanov/actual-mcp.git

# Verify remotes
git remote -v
# Should show:
# origin    https://github.com/tmorlion/actual-mcp.git (your fork)
# upstream  https://github.com/s-stefanov/actual-mcp.git (original repo)
```

### 3. Create Your Custom Branch

It's recommended to keep your custom changes on a dedicated branch:

```bash
# Create a custom branch from main
git checkout -b custom-main

# This will be your working branch with customizations
```

## Your Custom Changes

Document the changes you've made that differ from upstream:

### Current Customizations (as of 2026-01-18)

1. **API Compatibility Fixes** (`src/actual-api.ts` and related files)
   - Updated for `@actual-app/api` v26.1.0 compatibility
   - Fixed type signatures for create/update methods
   - Added proper type casting for API calls

2. **Docker Multi-Platform Support**
   - `docker-push.sh` - Build script for multi-platform images
   - `DOCKER.md` - Docker deployment documentation
   - `package.json` - Added docker:build and docker:push scripts

3. **Project Documentation**
   - `WARP.md` - Development rules and guidelines

## Syncing with Upstream

### Option 1: Regular Merge (Recommended)

This preserves your commit history and makes it clear what's custom:

```bash
# 1. Fetch latest from upstream
git fetch upstream

# 2. Switch to your custom branch
git checkout custom-main

# 3. Merge upstream changes
git merge upstream/main

# 4. Resolve any conflicts (see below)
# 5. Test thoroughly
npm run quality
npm run test

# 6. Push to your fork
git push origin custom-main
```

### Option 2: Rebase (Cleaner History)

This rewrites history but keeps it linear:

```bash
# 1. Fetch latest from upstream
git fetch upstream

# 2. Switch to your custom branch
git checkout custom-main

# 3. Rebase on upstream
git rebase upstream/main

# 4. Resolve conflicts if needed
# 5. Test thoroughly
# 6. Force push (since history was rewritten)
git push origin custom-main --force-with-lease
```

### Option 3: Cherry-Pick Specific Changes

If you only want specific upstream commits:

```bash
# 1. Fetch upstream
git fetch upstream

# 2. View commits
git log upstream/main

# 3. Cherry-pick specific commits
git cherry-pick <commit-hash>

# 4. Push
git push origin custom-main
```

## Handling Conflicts

When conflicts occur (they likely will with your API fixes), here's how to handle them:

### Common Conflict Scenarios

#### 1. `src/actual-api.ts` Conflicts

If upstream updates this file:

```bash
# Open the file and look for conflict markers
# <<<<<<< HEAD (your changes)
# =======
# >>>>>>> upstream/main (their changes)

# Strategy:
# - If they upgraded to @actual-app/api v26+, use their version
# - If they're still on v25, keep your version
# - Check their package.json to see what version they're using
```

#### 2. `package.json` / `package-lock.json` Conflicts

```bash
# For package.json:
# - Take their dependency versions
# - Keep your custom scripts (docker:build, docker:push)

# For package-lock.json:
# - After resolving package.json, regenerate:
rm package-lock.json
npm install
```

#### 3. Tool Files Conflicts

If `src/tools/*/index.ts` files conflict:

```bash
# Compare the API signatures:
# - If they match v26 API (proper types), use theirs
# - If they still use Record<string, unknown>, keep yours
```

### Conflict Resolution Commands

```bash
# Accept their version for a file
git checkout --theirs path/to/file

# Accept your version for a file
git checkout --ours path/to/file

# Manually edit and mark as resolved
git add path/to/file

# Continue merge/rebase
git merge --continue
# or
git rebase --continue
```

## Automated Sync Script

Use the provided script to automate the sync process:

```bash
# Run the sync script
./sync-upstream.sh

# Or via npm
npm run sync:upstream
```

## Monitoring Upstream Changes

### 1. Watch the Upstream Repository on GitHub

Click "Watch" on `s-stefanov/actual-mcp` to get notified of:
- New releases
- Major changes
- Dependency updates

### 2. Check for Updates Regularly

```bash
# Fetch and compare
git fetch upstream
git log HEAD..upstream/main --oneline

# See what changed
git diff HEAD..upstream/main
```

### 3. Review Their Changelog

Check their releases page:
https://github.com/s-stefanov/actual-mcp/releases

## Testing After Sync

Always test after syncing:

```bash
# 1. Run quality checks
npm run quality

# 2. Run tests
npm run test

# 3. Build the project
npm run build

# 4. Test Docker build
npm run docker:build

# 5. Test the MCP server locally
npm start
```

## When Upstream Updates @actual-app/api

If upstream upgrades to v26+, your changes might already be integrated:

```bash
# 1. Check their package.json version
cat package.json | grep "@actual-app/api"

# 2. If they upgraded to v26+:
#    - Review their type fixes
#    - Your changes might be redundant
#    - Accept their version and test

# 3. If they're still on v25:
#    - Keep your v26 fixes
#    - You're ahead of upstream
#    - Continue using your version
```


## Branching Strategy

Recommended branch structure:

- `main` - Mirrors upstream exactly (rarely touch)
- `custom-main` - Your working branch with customizations
- `feature/*` - For testing new features or preparing PRs
- `sync/*` - Temporary branches for complex merges

## Recovery from Mistakes

If something goes wrong:

```bash
# View recent operations
git reflog

# Restore to previous state
git reset --hard HEAD@{n}

# Or restore from remote
git fetch origin
git reset --hard origin/custom-main
```

## Best Practices

1. **Commit Your Changes First** - Always commit your work before syncing
2. **Sync Regularly** - Don't let your fork drift too far from upstream
3. **Keep Custom Changes Minimal** - Less custom code = easier syncing
4. **Document Changes** - Maintain CHANGELOG_CUSTOM.md of your modifications
5. **Test Thoroughly** - Always test after merging upstream changes
6. **Keep Fork Private** - Maintain your customizations in your own fork

## Summary

Your workflow should be:

1. **Weekly**: Check for upstream updates
2. **Before sync**: Commit all your changes
3. **Sync**: Merge upstream changes into your custom branch
4. **Resolve**: Handle conflicts carefully
5. **Test**: Run all quality checks and tests
6. **Deploy**: Build and push new Docker images if needed
