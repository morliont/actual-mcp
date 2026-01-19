# Docker Usage Guide

## Building and Publishing Docker Images

This project includes scripts to build and publish versioned Docker images to Docker Hub.

### Prerequisites

1. Docker installed and running
2. Docker Hub account
3. Logged in to Docker Hub: `docker login`

### Quick Start

#### Build Docker Image Locally (Current Platform Only)

```bash
npm run docker:build
```

Or directly with Docker:

```bash
docker build -t actual-mcp:latest .
```

Note: This builds for your current platform only (useful for local testing).

#### Build and Push Multi-Platform Image to Docker Hub

```bash
npm run docker:push
```

This script will:
1. Read the version from `package.json`
2. Build the Docker image for **both linux/amd64 and linux/arm64** platforms
3. Prompt for your Docker Hub username
4. Ask for confirmation before building and pushing
5. Push both versioned and `latest` tags to Docker Hub

**Important**: The multi-platform build uses Docker Buildx and automatically pushes to Docker Hub. It cannot be loaded locally.

You can also set your Docker Hub username as an environment variable:

```bash
export DOCKER_USERNAME=your-dockerhub-username
npm run docker:push
```

### Manual Docker Commands

#### Build Multi-Platform Image

```bash
# Get version from package.json
VERSION=$(node -pe "require('./package.json').version")

# Create buildx builder (one time only)
docker buildx create --name multiplatform-builder --use

# Build and push for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t your-username/actual-mcp:${VERSION} \
  -t your-username/actual-mcp:latest \
  --push \
  .
```

#### Build Single Platform (Local Testing)

```bash
# Build for current platform only
docker build -t actual-mcp:latest .
```

## Using in Portainer

### Deploy from Docker Hub

1. In Portainer, go to **Stacks** or **Containers**
2. Add a new container/stack
3. Use the image: `your-username/actual-mcp:1.7.0` (or `:latest` for latest version)
4. Set the required environment variables:
   - `ACTUAL_SERVER_URL` - Your Actual Budget server URL
   - `ACTUAL_PASSWORD` - Your Actual Budget password
   - `ACTUAL_BUDGET_SYNC_ID` - Your budget sync ID
   - `ACTUAL_BUDGET_ENCRYPTION_PASSWORD` - (Optional) If your budget is encrypted
   - `ACTUAL_DATA_DIR` - (Optional) Custom data directory, defaults to `~/.actual`
5. Expose port 3000 (or map to your preferred port)

### Example Docker Compose for Portainer

```yaml
version: '3.8'

services:
  actual-mcp:
    image: your-username/actual-mcp:1.7.0
    container_name: actual-mcp
    environment:
      - ACTUAL_SERVER_URL=https://your-actual-server.com
      - ACTUAL_PASSWORD=your-password
      - ACTUAL_BUDGET_SYNC_ID=your-budget-id
      # Optional:
      # - ACTUAL_BUDGET_ENCRYPTION_PASSWORD=your-encryption-password
      # - ACTUAL_DATA_DIR=/data/.actual
    ports:
      - "3000:3000"
    volumes:
      - actual-mcp-data:/app/.actual
    restart: unless-stopped

volumes:
  actual-mcp-data:
```

### Update to New Version

When a new version is released:

1. **Specific version** (recommended for production):
   ```bash
   docker pull your-username/actual-mcp:1.8.0
   ```

2. **Latest version**:
   ```bash
   docker pull your-username/actual-mcp:latest
   ```

3. In Portainer, update the container image and recreate the container

## Version Management

### Automatic Version Tagging

The `docker-push.sh` script automatically:
- Reads the version from `package.json`
- Tags the Docker image with both the version number and `latest`
- Ensures version consistency across npm package and Docker image

### Updating Versions

When you update the version in `package.json`:

```bash
# Update version (using npm version or manually editing package.json)
npm version patch  # 1.7.0 -> 1.7.1
# or
npm version minor  # 1.7.0 -> 1.8.0
# or
npm version major  # 1.7.0 -> 2.0.0

# Build and push new version
npm run docker:push
```

### Version Tags Available

- `your-username/actual-mcp:latest` - Always points to the most recent build
- `your-username/actual-mcp:1.7.0` - Specific version (immutable)
- `your-username/actual-mcp:1.7` - Minor version (updates with patches)
- `your-username/actual-mcp:1` - Major version (updates with minors and patches)

## Best Practices

1. **Use specific version tags in production** - Avoid `latest` in production to ensure consistency
2. **Tag releases properly** - Always update `package.json` version before building
3. **Test locally first** - Run `npm run docker:build` and test before pushing
4. **Keep versions in sync** - The Docker image version should match `package.json`
5. **Document breaking changes** - Update README when making breaking changes

## Troubleshooting

### Image Build Fails

```bash
# Clear Docker cache and rebuild
docker build --no-cache -t actual-mcp:latest .
```

### Can't Push to Docker Hub

```bash
# Re-login to Docker Hub
docker logout
docker login
```

### Wrong Version Tag

```bash
# Remove local images and rebuild
docker rmi your-username/actual-mcp:1.7.0
npm run docker:push
```
