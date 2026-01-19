# Warp Workflows Setup

## ✅ Installation Complete!

Your Warp workflows are installed and ready to use!

## 📍 Location

Workflows are installed in: `~/.warp/workflows/`

## 🎯 Available Commands

Just type these in Warp (they work from anywhere):

| Command | Description |
|---------|-------------|
| `sync-check` | Check for upstream updates (safe, read-only) |
| `sync-full` | Complete sync + test + deploy workflow |
| `docker-push` | Build & push multi-platform Docker image |
| `test-all` | Run complete test suite |
| `version-bump` | Bump version and deploy |
| `mcp-status` | Show project status and available commands |

## 🚀 Quick Start

1. **First time?** Start with:
   ```
   mcp-status
   ```
   This shows you the project status and all available commands.

2. **Check for updates weekly:**
   ```
   sync-check
   ```
   This is safe and won't make any changes.

3. **When ready to update:**
   ```
   sync-full
   ```
   This will guide you through the complete workflow.

## 💡 How It Works

When you type a command (e.g., `sync-check`):

1. Warp recognizes it as a workflow
2. Shows you what it will do
3. You can press Enter to run it
4. Or press Escape to cancel

## 🔧 Customization

To modify a command:

1. Edit the YAML file in `~/.warp/workflows/`
2. Save the file
3. Warp automatically reloads it

Example:
```bash
# Edit the sync-check command
code ~/.warp/workflows/sync-check.yaml
```

## 📝 Command Details

### sync-check
- Fetches upstream changes
- Shows how many commits you're behind/ahead
- Lists new commits
- Shows changed files
- **No modifications made**

### sync-full
- Runs the interactive `sync-upstream.sh` script
- Asks for confirmation before merging
- Guides you through conflict resolution
- Runs tests after successful merge

### docker-push
- Shows current version
- Builds for linux/amd64 and linux/arm64
- Pushes to Docker Hub (tmorlion/actual-mcp)
- Asks for Docker Hub login if needed

### test-all
- Runs linting, formatting, type checking
- Runs unit tests
- Builds the project
- Tests Docker build

### version-bump
- Shows current version
- Asks which bump type (patch/minor/major)
- Updates package.json
- Optionally builds and pushes Docker image

### mcp-status
- Shows current version
- Shows git branch and status
- Shows sync status with upstream
- Lists local Docker images
- Shows available commands

## 🆘 Troubleshooting

### Commands don't appear
1. Make sure you're using Warp (not another terminal)
2. Restart Warp
3. Check files exist: `ls ~/.warp/workflows/`

### Commands fail
1. Make sure you're in the project directory or:
2. The commands auto-navigate to: `~/Documents/Development/actual-budget-mcp`
3. Update the path in YAML files if your project is elsewhere

### Want to disable a command
1. Move or rename the YAML file:
   ```bash
   mv ~/.warp/workflows/sync-full.yaml ~/.warp/workflows/sync-full.yaml.disabled
   ```

## 🔄 Updating Commands

If you update the project location, edit each YAML file and change:
```yaml
cd ~/Documents/Development/actual-budget-mcp
```

To your new path.

## 📚 More Info

- Full documentation: See project root for UPSTREAM_SYNC.md, DOCKER.md
- Cheat sheet: CHEATSHEET.md
- AI prompts: .warp/ai-prompts.md

## 🎉 You're All Set!

Try it now:
```
mcp-status
```
