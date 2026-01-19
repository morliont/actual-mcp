# actual-budget-mcp Quick Reference

## 🚀 Quick Commands (Just Type These!)

```bash
mcp-status      # Show project status
sync-check      # Check for upstream updates (safe)
sync-full       # Complete sync + test + deploy
docker-push     # Build & push multi-platform Docker
test-all        # Run complete test suite
version-bump    # Bump version and deploy
```

**✅ These commands work anywhere in your terminal!**

### Alternative Commands
```bash
npm run sync:upstream    # Interactive sync script
npm run docker:push      # Docker build & push
npm run quality          # Quality checks
npm run test             # Run tests
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.warp/ai-prompts.md` | Pre-written AI prompts for all workflows |
| `UPSTREAM_SYNC.md` | Complete sync strategy guide |
| `DOCKER.md` | Docker deployment documentation |
| `CHANGELOG_CUSTOM.md` | Track your custom changes |
| `docker-push.sh` | Build & push multi-platform images |
| `sync-upstream.sh` | Interactive upstream sync |

## 🔄 Sync Workflow

1. **Check** → Type `sync-check` in Warp
2. **Review** → See what changed
3. **Merge** → Type `sync-full` or `npm run sync:upstream`
4. **Test** → Type `test-all`
5. **Deploy** → Type `docker-push`

## 🐳 Docker Quick Reference

```bash
# Build locally (single platform)
npm run docker:build

# Build & push multi-platform (linux/amd64, linux/arm64)
npm run docker:push

# Your Docker image
tmorlion/actual-mcp:1.7.0
tmorlion/actual-mcp:latest
```

## 🔧 Git Workflow

```bash
# Add upstream remote (one-time)
git remote add upstream https://github.com/s-stefanov/actual-mcp.git

# Fetch upstream changes
git fetch upstream

# See what's new
git log HEAD..upstream/main --oneline

# Merge upstream (interactive)
npm run sync:upstream

# Push to your fork
git push origin main
```

## ⚡ Warp Slash Commands

Just type these in Warp (no prefix needed):

- `sync-check` - Check updates only (safe)
- `sync-full` - Complete workflow (check → merge → test → deploy)
- `docker-push` - Build & push Docker only
- `test-all` - Run all tests
- `version-bump` - Bump version and deploy
- `mcp-status` - Show project status and commands

### For AI Help (copy from .warp/ai-prompts.md):
- `/sync-merge` - Merge after manual review
- `/resolve-conflicts` - Help with merge conflicts
- `/rollback` - Undo recent changes

## 📊 Your Customizations

### Modified Files (may conflict when syncing)
- `src/actual-api.ts` - API v26 compatibility
- `src/core/data/fetch-categories.ts` - Filter category groups
- `src/tools/**/*.ts` - Proper type signatures
- `package.json` - Custom scripts

### Custom Files (won't conflict)
- `docker-push.sh` - Multi-platform Docker builds
- `sync-upstream.sh` - Upstream sync automation
- `DOCKER.md`, `UPSTREAM_SYNC.md` - Documentation
- `.warp/` - AI prompt shortcuts

## 🆘 Common Issues

### Merge Conflicts
```bash
# Option 1: Use Warp AI
Copy /resolve-conflicts from .warp/ai-prompts.md

# Option 2: Manual resolution
git status  # See conflicts
# Edit files, then:
git add <resolved-files>
git merge --continue
```

### Docker Build Fails
```bash
# Use Node 22 in Docker
docker run --rm -v "$(pwd)":/app -w /app node:22-alpine npm install
docker build -t actual-mcp:latest .
```

### Version Mismatch
```bash
# Check what upstream is using
git fetch upstream
git show upstream/main:package.json | grep "@actual-app/api"

# If they upgraded to v26+, their fixes might work
# If still v25, keep your version
```

## 📞 Getting Started in New Warp Session

**Super simple - just type the command!**

1. Open Warp in the project directory
2. Type one of these commands:
   - `sync-check` - See what's new
   - `sync-full` - Full workflow
   - `mcp-status` - Show status
3. Press Enter

That's it! The commands run automatically.

**For AI-assisted tasks:** Open `.warp/ai-prompts.md` and copy prompts for conflict resolution or rollbacks.

---

**Your Fork:** `tmorlion/actual-mcp`  
**Upstream:** `s-stefanov/actual-mcp`  
**Docker Hub:** `tmorlion/actual-mcp:latest`
