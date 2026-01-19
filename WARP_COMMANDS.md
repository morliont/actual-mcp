# Warp Custom Commands - Quick Start

## ✅ Installation Complete!

Your custom Warp workflows are installed at: `~/.warp/workflows/`

## 🎯 How to Use

### In Warp Terminal

1. Open Warp
2. Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to open the workflow search
3. Type the command name (e.g., "sync-check")
4. Press Enter to run

**OR**

1. Start typing the command name in Warp
2. Warp will show autocomplete suggestions
3. Select the workflow and press Enter

## 📋 Available Commands

| Command | What It Does | Safety |
|---------|--------------|--------|
| **mcp-status** | Show project status & available commands | ✅ Safe (read-only) |
| **sync-check** | Check for upstream updates | ✅ Safe (read-only) |
| **sync-full** | Complete sync + test + deploy | ⚠️ Asks before changes |
| **docker-push** | Build & push Docker image | ⚠️ Asks before pushing |
| **test-all** | Run all tests | ✅ Safe (testing only) |
| **version-bump** | Bump version & deploy | ⚠️ Asks before changes |

## 🚀 Recommended Workflow

### First Time
```
1. Run: mcp-status
   Shows everything you need to know
```

### Weekly Check
```
1. Run: sync-check
   See if there are upstream updates
```

### When Updates Available
```
1. Run: sync-full
   Guides you through: check → merge → test → deploy
```

### Just Deploy Docker
```
1. Run: docker-push
   Builds and pushes to Docker Hub
```

## 💡 Command Details

### mcp-status
**What:** Shows project overview
**Output:**
- Current version
- Git branch and status
- Sync status with upstream
- Local Docker images
- List of available commands

**Use:** Start here when opening a new session

---

### sync-check
**What:** Checks for upstream updates
**Output:**
- How many commits behind/ahead
- List of new commits
- Files that changed

**Use:** Weekly check, completely safe

---

### sync-full
**What:** Complete update workflow
**Steps:**
1. Checks for updates
2. Shows what changed
3. Asks if you want to merge
4. Runs interactive sync script
5. Helps with conflicts if any
6. Runs tests after merge

**Use:** When ready to update your fork

---

### docker-push
**What:** Build & deploy Docker image
**Steps:**
1. Shows current version
2. Builds for amd64 + arm64
3. Asks for Docker Hub username
4. Asks for confirmation
5. Pushes to tmorlion/actual-mcp

**Use:** After code changes to deploy

---

### test-all
**What:** Run complete test suite
**Steps:**
1. Quality checks (lint, format, types)
2. Unit tests
3. Build project
4. Test Docker build

**Use:** After merging or before deploying

---

### version-bump
**What:** Increment version and deploy
**Steps:**
1. Shows current version
2. Asks: patch / minor / major
3. Updates package.json
4. Asks if you want to deploy Docker

**Use:** When releasing a new version

## 🔧 Alternative Methods

If Warp workflows don't work for you, use npm scripts instead:

```bash
# Check for updates
npm run sync:upstream   # Interactive script

# Deploy Docker
npm run docker:push

# Run tests
npm run quality && npm run test
```

## 📱 Using Warp's Workflow Picker

**Keyboard shortcut:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

1. Press the shortcut
2. A search box appears
3. Type command name
4. See description and tags
5. Press Enter to run

## 🆘 Troubleshooting

### Don't see commands in Warp?

**Solution 1:** Restart Warp
```
Quit Warp completely and reopen
```

**Solution 2:** Check files exist
```bash
ls ~/.warp/workflows/
# Should show: sync-check.yaml, sync-full.yaml, etc.
```

**Solution 3:** Check Warp settings
```
1. Open Warp Settings
2. Go to Features → Workflows
3. Make sure workflows are enabled
```

### Commands don't work?

The workflows automatically navigate to:
`~/Documents/Development/actual-budget-mcp`

If your project is elsewhere, edit each `.yaml` file in `~/.warp/workflows/` and update the path.

## 🎨 Customizing Commands

Edit any workflow file:

```bash
# Example: Edit sync-check
code ~/.warp/workflows/sync-check.yaml

# After saving, Warp reloads automatically
```

## 📚 More Resources

- **CHEATSHEET.md** - One-page quick reference
- **UPSTREAM_SYNC.md** - Detailed sync strategy
- **DOCKER.md** - Docker deployment guide
- **.warp/SETUP.md** - Detailed setup info
- **.warp/ai-prompts.md** - AI-assisted prompts

## 🎉 You're Ready!

Start with:
1. Open Warp
2. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
3. Type "mcp-status"
4. Press Enter

Or just start typing "mcp" and see the autocomplete!

---

**Your Workflows:** `~/.warp/workflows/`  
**Your Fork:** `tmorlion/actual-mcp`  
**Docker Hub:** `tmorlion/actual-mcp:latest`
