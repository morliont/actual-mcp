# Development Workflow

This project uses **trunk-based development** with automated quality checks and releases.

## 🌳 Trunk-Based Development

All development happens directly on `main` branch. Quality is ensured through:
- **Pre-commit hooks** - Run before every commit
- **Pre-push hooks** - Run before every push to main
- **Automated releases** - Triggered by version tags

## 🔒 Pre-Commit Checks

Every commit automatically runs these checks (takes ~30-60 seconds):

1. **Type checking** - `npm run type-check`
2. **Linting** - `npm run lint`
3. **Format checking** - `npm run format:check`
4. **Unit tests** - `npm run test:unit` (~136 tests)
5. **Build** - `npm run build`

**If any check fails, the commit is blocked.**

### Example:
```bash
git add .
git commit -m "Add new feature"

# Output:
# 🔍 Running pre-commit checks...
# 1️⃣  Type checking...
# 2️⃣  Linting...
# 3️⃣  Format checking...
# 4️⃣  Running unit tests...
# 5️⃣  Building...
# ✅ All pre-commit checks passed!
```

## 🚀 Pre-Push Checks

When pushing to `main`, additional E2E tests run (takes ~2-5 minutes):

1. **Server E2E tests** - `npm run test:e2e`
2. **Tool E2E tests** - `npm run test:e2e:tools` (all 26 MCP tools)
3. **Docker E2E tests** - `npm run docker:test`

**If any check fails, the push is blocked.**

### Example:
```bash
git push origin main

# Output:
# 🚀 Running pre-push checks...
# 1️⃣  Running server E2E tests...
# 2️⃣  Running tool E2E tests...
# 3️⃣  Running Docker E2E tests...
# ✅ All pre-push checks passed!
```

## 📦 Release Process

Releases are **fully automated** and triggered by version tags.

### Step 1: Update Version
```bash
# Update version in package.json
npm version patch  # 1.9.3 -> 1.9.4
# or
npm version minor  # 1.9.3 -> 1.10.0
# or
npm version major  # 1.9.3 -> 2.0.0
```

This automatically:
- Updates `package.json`
- Creates a git commit
- Creates a git tag (e.g., `v1.9.4`)

### Step 2: Push the Tag
```bash
git push --follow-tags
```

### Step 3: Automated Release (GitHub Actions)

Once the tag is pushed, GitHub Actions automatically:

1. **Generates Release Notes** from commit messages:
   - Categorizes commits (Features, Bug Fixes, Tests, Docs)
   - Counts changes by type
   - Creates structured changelog

2. **Creates GitHub Release**:
   - Publishes release with generated notes
   - Links to full changelog

3. **Builds & Pushes Docker Images**:
   - Multi-platform build (linux/amd64, linux/arm64)
   - Tags: `tmorlion/actual-mcp:x.x.x` and `tmorlion/actual-mcp:latest`
   - Pushes to Docker Hub
   - Updates Docker Hub description

### Commit Message Conventions

For best release notes, use these prefixes:

- `feat:` / `add:` / `new:` → **✨ New Features**
- `fix:` / `bug:` → **🐛 Bug Fixes**
- `test:` → **🧪 Testing**
- `doc:` → **📚 Documentation**
- Everything else → **🔧 Other Changes**

**Examples:**
```bash
git commit -m "feat: Add support for recurring transactions"
git commit -m "fix: Resolve crash on empty payee list"
git commit -m "test: Add E2E tests for category operations"
git commit -m "doc: Update installation instructions"
```

## 🛠️ Development Workflow

### Making Changes
```bash
# 1. Make your changes
vim src/tools/my-tool.ts

# 2. Commit (pre-commit checks run automatically)
git add .
git commit -m "feat: Add new tool for budget forecasting"

# 3. Push to main (pre-push checks run automatically)
git push origin main

# At this point, code is on main but not released
```

### Creating a Release
```bash
# 1. Bump version
npm version patch  # Creates commit + tag

# 2. Push with tags
git push --follow-tags

# 3. Wait for GitHub Actions (~5 minutes)
# - Release created automatically
# - Docker images built and pushed
# - You'll get a notification when complete
```

### Monitoring Releases
```bash
# Check workflow status
gh run list --workflow=release.yml --limit 5

# Watch current release
gh run watch

# View release
gh release view v1.9.4
```

## 🚨 Bypassing Hooks (Emergency Only)

**Not recommended**, but if absolutely necessary:

```bash
# Skip pre-commit checks
git commit --no-verify -m "Emergency hotfix"

# Skip pre-push checks
git push --no-verify origin main
```

## 🔧 Troubleshooting

### Pre-commit Hooks Not Running

```bash
# Reinstall hooks
npm run prepare  # or: npx husky install
```

### Format Check Failed

```bash
# Auto-fix formatting
npm run format

# Then commit again
git add .
git commit -m "fix: Format code"
```

### Tests Failed

```bash
# Run specific test
npm run test:unit -- path/to/test.test.ts

# Check what failed
npm run test:unit
```

### Release Failed

```bash
# Check GitHub Actions logs
gh run list --workflow=release.yml
gh run view <run-id>

# Common issues:
# - Docker credentials expired (update secrets)
# - Build failed (check build locally first)
```

## 📊 Workflow Summary

```
Developer          Pre-Commit Hook         Pre-Push Hook         GitHub Actions
─────────         ─────────────────       ────────────────      ─────────────────
   │                     │                       │                      │
   │  git commit        │                       │                      │
   ├───────────────────>│                       │                      │
   │                    │ Type check            │                      │
   │                    │ Lint                  │                      │
   │                    │ Format                │                      │
   │                    │ Unit tests            │                      │
   │                    │ Build                 │                      │
   │<───────────────────┤ ✅ Pass               │                      │
   │                     │                       │                      │
   │  git push          │                       │                      │
   ├────────────────────┼──────────────────────>│                      │
   │                    │                       │ Server E2E           │
   │                    │                       │ Tool E2E             │
   │                    │                       │ Docker E2E           │
   │<───────────────────┼───────────────────────┤ ✅ Pass              │
   │                     │                       │                      │
   │  npm version patch │                       │                      │
   │  git push --follow-tags                    │                      │
   ├────────────────────┼───────────────────────┼─────────────────────>│
   │                    │                       │                      │ Generate notes
   │                    │                       │                      │ Create release
   │                    │                       │                      │ Build Docker
   │                    │                       │                      │ Push images
   │<───────────────────┴───────────────────────┴──────────────────────┤ 🎉 Released
```

## 🎯 Best Practices

1. **Commit frequently** - Small, focused commits are better
2. **Use meaningful commit messages** - Helps with release notes
3. **Run tests locally** before committing to catch issues early
4. **Create releases regularly** - Don't let changes pile up
5. **Monitor GitHub Actions** - Check that releases complete successfully
6. **Update CHANGELOG.md** manually for major releases if needed

## 📝 Quick Reference

```bash
# Daily development
git add .
git commit -m "feat: Your feature"
git push

# Create release
npm version patch
git push --follow-tags

# Manual test runs
npm run test:all              # All tests
npm run quality               # Lint + format + types
npm run docker:test           # Docker E2E

# Check status
gh run list                   # Recent workflow runs
gh release list               # Recent releases
```

## 🔗 Related Documentation

- [TESTING.md](./TESTING.md) - Detailed testing guide
- [README.md](./README.md) - Project setup and usage
- [GitHub Actions](./.github/workflows/) - Workflow configurations
