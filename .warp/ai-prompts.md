# Warp AI Prompts for actual-budget-mcp

Copy and paste these prompts into Warp AI to trigger specific workflows.

---

## /sync-full

```
Please perform a complete upstream sync and deployment for the actual-budget-mcp project:

1. Check for updates from upstream (s-stefanov/actual-mcp)
2. Review what's changed and identify potential conflicts
3. Merge/sync the changes with my custom modifications
4. Review the merge results and resolve any conflicts
5. Run all quality checks (lint, format, type-check)
6. Run tests
7. Build the project
8. Build and push multi-platform Docker image to Docker Hub (tmorlion/actual-mcp)

Please stop and ask for confirmation before:
- Actually merging upstream changes
- Pushing to Docker Hub

Reference files:
- UPSTREAM_SYNC.md for sync strategy
- CHANGELOG_CUSTOM.md for my custom changes
- DOCKER.md for Docker deployment
```

---

## /sync-check

```
Check for updates in the upstream actual-budget-mcp repository (s-stefanov/actual-mcp):

1. Fetch from upstream
2. Show me what commits are new
3. Show a summary of file changes
4. Identify if any of my custom files would conflict (check CHANGELOG_CUSTOM.md for the list)
5. Check if they've updated @actual-app/api dependency

Don't merge anything yet, just show me what's available.
```

---

## /sync-merge

```
I've reviewed the upstream changes and want to proceed with merging:

1. Run the sync-upstream.sh script (choose merge option)
2. Help me resolve any conflicts that arise
3. After conflicts are resolved, run quality checks and tests
4. Review the final merged state

Reference CHANGELOG_CUSTOM.md for our custom modifications.
```

---

## /docker-push

```
Rebuild and push the Docker image for actual-budget-mcp:

1. Verify the current version in package.json
2. Run docker-push.sh to build multi-platform image (linux/amd64, linux/arm64)
3. Push to Docker Hub as tmorlion/actual-mcp with version tag and latest tag

My Docker Hub username is: tmorlion

Please confirm before actually pushing to Docker Hub.
```

---

## /test-all

```
Run complete testing suite after upstream sync:

1. npm run quality (lint + format-check + type-check)
2. npm run test (unit tests)
3. npm run build (TypeScript compilation)
4. npm run docker:build (test Docker build locally)

Show me results of each step and identify any issues.
```

---

## /resolve-conflicts

```
I'm in the middle of merging upstream changes and have conflicts. Help me resolve them:

1. Show me which files have conflicts
2. For each conflict, analyze:
   - What upstream changed
   - What my custom version has
   - Recommend a resolution strategy based on CHANGELOG_CUSTOM.md
3. Help me resolve the conflicts
4. Complete the merge

Key files to watch:
- src/actual-api.ts (API v26 compatibility)
- package.json (custom scripts)
- Tool files in src/tools/
```

---

## /version-bump

```
Bump version and deploy new release:

1. Check current version in package.json
2. Bump to next patch/minor version (ask me which)
3. Update CHANGELOG_CUSTOM.md with sync date
4. Commit the version change
5. Build and push Docker image with new version tag
6. Show me the final Docker image tags

Docker Hub username: tmorlion
```

---

## /rollback

```
I need to rollback recent changes:

1. Show me the last 10 git operations (git reflog)
2. Show me what changed in the last commit
3. Help me decide what to rollback
4. Execute the rollback
5. Verify the state

Don't proceed without my confirmation on what to rollback.
```

---

## Usage

1. Open this file in Warp
2. Copy the prompt you need (everything under the command name)
3. Paste into Warp AI chat
4. Hit enter

Or, you can type the command name (e.g., `/sync-full`) and reference this file.
