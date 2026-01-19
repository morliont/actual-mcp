#!/bin/bash

# Docker Push Script for actual-mcp
# This script builds and pushes Docker images to Docker Hub with proper versioning

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from package.json
VERSION=$(node -pe "require('./package.json').version")
DOCKER_USERNAME="${DOCKER_USERNAME:-}"

echo -e "${GREEN}Building actual-mcp Docker image v${VERSION}${NC}"

# Prompt for Docker Hub username if not set
if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${YELLOW}Enter your Docker Hub username:${NC}"
    read -r DOCKER_USERNAME
fi

IMAGE_NAME="${DOCKER_USERNAME}/actual-mcp"

echo -e "${GREEN}Building multi-platform image: ${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${YELLOW}This will build for both linux/amd64 and linux/arm64 and push to Docker Hub${NC}"
echo -e "${YELLOW}Continue? (y/n)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}Build cancelled.${NC}"
    exit 0
fi

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Not logged in to Docker Hub. Please log in:${NC}"
    docker login
fi

# Check if buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo -e "${RED}Error: docker buildx is not available${NC}"
    echo -e "${YELLOW}Please enable Docker BuildKit${NC}"
    exit 1
fi

# Create builder instance if it doesn't exist
if ! docker buildx inspect multiplatform-builder > /dev/null 2>&1; then
    echo -e "${YELLOW}Creating multi-platform builder...${NC}"
    docker buildx create --name multiplatform-builder --use
else
    docker buildx use multiplatform-builder
fi

# Build for multiple platforms
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t "${IMAGE_NAME}:${VERSION}" \
    -t "${IMAGE_NAME}:latest" \
    --push \
    .

echo -e "${GREEN}✓ Successfully built and pushed multi-platform images!${NC}"
echo -e "${GREEN}  - ${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${GREEN}  - ${IMAGE_NAME}:latest${NC}"
echo -e "${GREEN}  Platforms: linux/amd64, linux/arm64${NC}"
echo ""
echo -e "You can now use this in Portainer:"
echo -e "  ${IMAGE_NAME}:${VERSION}"
