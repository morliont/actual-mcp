#!/bin/bash
# Warp Aliases for actual-budget-mcp
# Source this file in your shell config: source ~/.warp/aliases.sh

PROJECT_DIR="$HOME/Documents/Development/actual-budget-mcp"

# Show project status
mcp-status() {
  echo "📊 Actual Budget MCP - Status"
  cd "$PROJECT_DIR" || return
  
  echo ""
  echo "📦 Version:"
  node -pe "require('./package.json').version"
  
  echo ""
  echo "🔧 Git Branch:"
  git branch --show-current
  
  echo ""
  echo "📝 Git Status:"
  git status -s
  
  echo ""
  echo "🔄 Sync Status:"
  if git remote | grep -q "^upstream$"; then
    git fetch upstream 2>/dev/null
    BEHIND=$(git rev-list --count HEAD..upstream/main 2>/dev/null || echo "0")
    AHEAD=$(git rev-list --count upstream/main..HEAD 2>/dev/null || echo "0")
    echo "  Behind upstream: $BEHIND commit(s)"
    echo "  Ahead of upstream: $AHEAD commit(s)"
  else
    echo "  Upstream remote not configured"
  fi
  
  echo ""
  echo "💡 Quick Commands:"
  echo "  sync-check    - Check for updates"
  echo "  sync-full     - Full sync + deploy"
  echo "  docker-push   - Push to Docker Hub"
  echo "  test-all      - Run all tests"
  echo "  version-bump  - Bump version"
}

# Check for upstream updates
sync-check() {
  echo "🔍 Checking for upstream updates..."
  cd "$PROJECT_DIR" || return
  
  # Add upstream if not exists
  if ! git remote | grep -q "^upstream$"; then
    git remote add upstream https://github.com/s-stefanov/actual-mcp.git
  fi
  
  git fetch upstream
  
  COMMITS_BEHIND=$(git rev-list --count HEAD..upstream/main)
  COMMITS_AHEAD=$(git rev-list --count upstream/main..HEAD)
  
  echo ""
  echo "📊 Status:"
  echo "  You are $COMMITS_BEHIND commit(s) behind upstream"
  echo "  You are $COMMITS_AHEAD commit(s) ahead of upstream"
  echo ""
  
  if [ "$COMMITS_BEHIND" -gt 0 ]; then
    echo "📝 New commits in upstream:"
    git log --oneline HEAD..upstream/main | head -10
    echo ""
    echo "📄 Changed files:"
    git diff --name-only HEAD..upstream/main
    echo ""
    echo "💡 To merge: Run 'sync-full' or 'npm run sync:upstream'"
  else
    echo "✅ You're up to date!"
  fi
}

# Full sync workflow
sync-full() {
  echo "🚀 Starting complete upstream sync and deployment workflow..."
  cd "$PROJECT_DIR" || return
  echo ""
  echo "This will:"
  echo "  1. Check for updates from upstream (s-stefanov/actual-mcp)"
  echo "  2. Show what's changed and identify potential conflicts"
  echo "  3. Merge/sync the changes with custom modifications"
  echo "  4. Run all quality checks and unit tests"
  echo "  5. Push to GitHub"
  echo "  6. Run e2e tests"
  echo "  7. Build and push Docker image to Docker Hub"
  echo "  8. Create GitHub release"
  echo ""
  echo -n "Continue? (y/n) "
  read -r REPLY
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    return 0
  fi

  # Step 1-4: Sync upstream (includes quality checks and unit tests)
  echo ""
  echo "📥 Step 1-4: Syncing from upstream..."
  if ! npm run sync:upstream; then
    echo "❌ Upstream sync failed or has conflicts. Resolve conflicts and re-run."
    return 1
  fi

  # Step 5: Push to GitHub
  echo ""
  echo "📤 Step 5: Pushing to GitHub..."
  if ! git push; then
    echo "❌ Failed to push to GitHub."
    return 1
  fi
  echo "✅ Pushed to GitHub"

  # Step 6: Run e2e tests
  echo ""
  echo "🧪 Step 6: Running e2e tests..."
  if ! npm run test:e2e; then
    echo "❌ E2E tests failed."
    return 1
  fi
  if ! npm run test:e2e:tools; then
    echo "❌ E2E tools tests failed."
    return 1
  fi
  echo "✅ All e2e tests passed"

  # Step 7: Build and push Docker
  echo ""
  echo "🐳 Step 7: Building and pushing Docker image..."
  if ! npm run docker:push; then
    echo "❌ Docker push failed."
    return 1
  fi
  echo "✅ Docker images pushed"

  # Step 8: Create GitHub release
  echo ""
  echo "🏷️  Step 8: Creating GitHub release..."
  # Push tags to GitHub (triggers automatic release via GitHub Actions)
  if git push --tags 2>&1 | grep -q "Everything up-to-date"; then
    echo "ℹ️  All tags already pushed, GitHub release should exist"
  else
    echo "✅ Tags pushed, GitHub release will be created automatically"
  fi

  echo ""
  echo "🎉 Full sync and deployment complete!"
}

# Docker push
docker-push() {
  echo "🐳 Building and pushing Docker image..."
  cd "$PROJECT_DIR" || return
  
  VERSION=$(node -pe "require('./package.json').version")
  echo "📦 Version: $VERSION"
  echo "🏷️  Tags: tmorlion/actual-mcp:$VERSION, tmorlion/actual-mcp:latest"
  echo "🌍 Platforms: linux/amd64, linux/arm64"
  echo ""
  
  npm run docker:push
}

# Run all tests
test-all() {
  echo "🧪 Running complete test suite..."
  cd "$PROJECT_DIR" || return
  
  echo ""
  echo "1️⃣ Quality checks (lint + format + types)..."
  npm run quality
  
  echo ""
  echo "2️⃣ Unit tests..."
  npm run test
  
  echo ""
  echo "3️⃣ Build..."
  npm run build
  
  echo ""
  echo "4️⃣ Docker build test..."
  npm run docker:build
  
  echo ""
  echo "✅ All tests complete!"
}

# Version bump
version-bump() {
  echo "📦 Version bump and deploy..."
  cd "$PROJECT_DIR" || return
  
  CURRENT=$(node -pe "require('./package.json').version")
  echo "Current version: $CURRENT"
  echo ""
  echo "Choose version bump:"
  echo "  1) Patch (1.7.0 → 1.7.1)"
  echo "  2) Minor (1.7.0 → 1.8.0)"
  echo "  3) Major (1.7.0 → 2.0.0)"
  echo ""
  echo -n "Enter choice (1-3): "
  read -r REPLY
  
  case $REPLY in
    1) npm version patch ;;
    2) npm version minor ;;
    3) npm version major ;;
    *) echo "Invalid choice"; return 1 ;;
  esac
  
  NEW=$(node -pe "require('./package.json').version")
  echo ""
  echo "✅ Bumped to v$NEW"
  echo ""
  echo -n "Build and push Docker image? (y/n) "
  read -r REPLY
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run docker:push
  fi
}

echo "✅ Actual Budget MCP aliases loaded!"
echo "Available commands: mcp-status, sync-check, sync-full, docker-push, test-all, version-bump"
