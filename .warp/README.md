# Warp Quick Commands

This directory contains pre-written prompts for common workflows in this project.

## Quick Start

In any new Warp AI session, you can use these shortcuts by copying the prompts from `ai-prompts.md`.

## Available Commands

| Command | Description | File |
|---------|-------------|------|
| `/sync-full` | Complete upstream sync + test + deploy | `ai-prompts.md` |
| `/sync-check` | Check what's new upstream (no merge) | `ai-prompts.md` |
| `/sync-merge` | Merge upstream changes after review | `ai-prompts.md` |
| `/docker-push` | Build & push multi-platform Docker image | `ai-prompts.md` |
| `/test-all` | Run complete test suite | `ai-prompts.md` |
| `/resolve-conflicts` | Help resolve merge conflicts | `ai-prompts.md` |
| `/version-bump` | Bump version and deploy | `ai-prompts.md` |
| `/rollback` | Undo recent changes | `ai-prompts.md` |

## How to Use

### Method 1: Copy from ai-prompts.md (Recommended)
```bash
# 1. Open ai-prompts.md
cat .warp/ai-prompts.md

# 2. Copy the full prompt for the command you need
# 3. Paste into Warp AI
# 4. Press Enter
```

### Method 2: Type in Warp AI directly
```
Just type the command name in Warp AI and describe what you want:

"Run /sync-full to check for updates and deploy"
```

### Method 3: Reference the prompt file
```
Open .warp/ai-prompts.md and follow the /sync-full workflow
```

## Most Common Workflows

### Weekly Update Check
Use: `/sync-check`
- Checks what's new without making changes
- Safe to run anytime

### Full Sync & Deploy
Use: `/sync-full`
- Complete workflow: check → merge → test → deploy
- Asks for confirmation at key steps

### Just Deploy Docker
Use: `/docker-push`
- When code is ready, just rebuild Docker
- Pushes to tmorlion/actual-mcp

### After Merge Testing
Use: `/test-all`
- Run all quality checks
- Validate everything works

## Tips

1. **Always commit your work first** before running sync commands
2. **Reference CHANGELOG_CUSTOM.md** to understand your customizations
3. **Check UPSTREAM_SYNC.md** for detailed sync strategies
4. **Use `/sync-check` weekly** to stay up to date

## Files in this Directory

- `README.md` - This file (quick reference)
- `ai-prompts.md` - Full prompt templates for all commands
- `workflows/` - Warp workflow YAML files (if configured)

## Related Documentation

- [UPSTREAM_SYNC.md](../UPSTREAM_SYNC.md) - Detailed sync strategy
- [DOCKER.md](../DOCKER.md) - Docker deployment guide
- [CHANGELOG_CUSTOM.md](../CHANGELOG_CUSTOM.md) - Your custom changes
- [WARP_PROMPT.md](../.github/WARP_PROMPT.md) - Detailed prompt templates

## Need Help?

If you're unsure which command to use:

1. Start with `/sync-check` to see what's available
2. Review the changes
3. Then decide on `/sync-full` or `/sync-merge`
