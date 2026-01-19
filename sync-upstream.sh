#!/bin/bash

# Upstream Sync Script for actual-mcp
# This script helps sync your fork with the upstream repository

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Actual MCP Upstream Sync ===${NC}\n"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}Error: You have uncommitted changes${NC}"
    echo -e "${YELLOW}Please commit or stash your changes first:${NC}"
    echo "  git add -A"
    echo "  git commit -m 'Your commit message'"
    echo "  or"
    echo "  git stash"
    exit 1
fi

# Check if upstream remote exists
if ! git remote | grep -q "^upstream$"; then
    echo -e "${YELLOW}Upstream remote not found. Adding it now...${NC}"
    git remote add upstream https://github.com/s-stefanov/actual-mcp.git
    echo -e "${GREEN}✓ Added upstream remote${NC}\n"
fi

# Fetch from upstream
echo -e "${BLUE}Fetching from upstream...${NC}"
git fetch upstream
echo -e "${GREEN}✓ Fetched from upstream${NC}\n"

# Show what's new
echo -e "${BLUE}Comparing with upstream/main...${NC}"
COMMITS_BEHIND=$(git rev-list --count HEAD..upstream/main)
COMMITS_AHEAD=$(git rev-list --count upstream/main..HEAD)

echo -e "${YELLOW}You are ${COMMITS_BEHIND} commit(s) behind upstream/main${NC}"
echo -e "${YELLOW}You are ${COMMITS_AHEAD} commit(s) ahead of upstream/main${NC}\n"

if [ "$COMMITS_BEHIND" -eq 0 ]; then
    echo -e "${GREEN}✓ You're already up to date with upstream!${NC}"
    exit 0
fi

# Show new commits
echo -e "${BLUE}New commits in upstream/main:${NC}"
git log --oneline HEAD..upstream/main | head -10
echo ""

# Check for potential conflicts
echo -e "${BLUE}Checking for potential conflicts...${NC}"
CONFLICT_FILES=$(git diff --name-only HEAD..upstream/main | grep -E "^(src/actual-api\.ts|package\.json|src/tools/)" || true)

if [ -n "$CONFLICT_FILES" ]; then
    echo -e "${YELLOW}Warning: These files may have conflicts:${NC}"
    echo "$CONFLICT_FILES"
    echo ""
fi

# Ask for merge strategy
echo -e "${YELLOW}How would you like to sync?${NC}"
echo "  1) Merge (recommended, preserves history)"
echo "  2) Rebase (cleaner history, may need force push)"
echo "  3) Show detailed diff and exit"
echo "  4) Cancel"
echo ""
read -p "Choose option (1-4): " CHOICE

case $CHOICE in
    1)
        echo -e "${BLUE}Merging upstream/main...${NC}"
        if git merge upstream/main --no-edit; then
            echo -e "${GREEN}✓ Successfully merged!${NC}"
            MERGED=true
        else
            echo -e "${RED}Merge conflicts detected!${NC}"
            echo -e "${YELLOW}Please resolve conflicts, then run:${NC}"
            echo "  git add <resolved-files>"
            echo "  git merge --continue"
            exit 1
        fi
        ;;
    2)
        echo -e "${BLUE}Rebasing on upstream/main...${NC}"
        if git rebase upstream/main; then
            echo -e "${GREEN}✓ Successfully rebased!${NC}"
            echo -e "${YELLOW}Note: You'll need to force push: git push --force-with-lease${NC}"
            MERGED=true
        else
            echo -e "${RED}Rebase conflicts detected!${NC}"
            echo -e "${YELLOW}Please resolve conflicts, then run:${NC}"
            echo "  git add <resolved-files>"
            echo "  git rebase --continue"
            exit 1
        fi
        ;;
    3)
        echo -e "${BLUE}Detailed diff with upstream/main:${NC}\n"
        git diff HEAD..upstream/main
        exit 0
        ;;
    *)
        echo -e "${YELLOW}Sync cancelled.${NC}"
        exit 0
        ;;
esac

# If we successfully merged, run tests
if [ "${MERGED}" = true ]; then
    echo ""
    echo -e "${BLUE}Running quality checks...${NC}"
    
    # Check if npm scripts exist
    if grep -q '"quality"' package.json 2>/dev/null; then
        if npm run quality; then
            echo -e "${GREEN}✓ Quality checks passed${NC}"
        else
            echo -e "${YELLOW}⚠ Quality checks failed. Please review and fix.${NC}"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}=== Sync Complete ===${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Review the changes: git log"
    echo "  2. Test the application: npm start"
    echo "  3. Push to your fork: git push origin $(git branch --show-current)"
    echo "  4. Rebuild Docker image: npm run docker:push"
fi
