#!/bin/bash
# Docker E2E Test Script
# Tests the actual Docker container to catch issues before deployment

set -e

echo "🐳 Docker E2E Test Script"
echo "=========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TEST_PORT=3002
CONTAINER_NAME="actual-mcp-e2e-test"
IMAGE_TAG="actual-mcp:e2e-test"

cleanup() {
  echo -e "${YELLOW}Cleaning up...${NC}"
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
}

# Cleanup on exit
trap cleanup EXIT

echo -e "${YELLOW}Step 1: Building Docker image...${NC}"
docker build -t $IMAGE_TAG .

echo -e "${YELLOW}Step 2: Starting container...${NC}"
docker run -d \
  --name $CONTAINER_NAME \
  -p $TEST_PORT:3000 \
  -e NODE_ENV=test \
  $IMAGE_TAG \
  --sse --port 3000

echo -e "${YELLOW}Step 3: Waiting for container to start...${NC}"
sleep 5

# Check if container is still running
if ! docker ps | grep -q $CONTAINER_NAME; then
  echo -e "${RED}❌ Container crashed on startup!${NC}"
  echo "Container logs:"
  docker logs $CONTAINER_NAME
  exit 1
fi

echo -e "${GREEN}✓ Container started successfully${NC}"

echo -e "${YELLOW}Step 4: Testing health endpoint...${NC}"
if curl -f -s http://localhost:$TEST_PORT/.well-known/oauth-authorization-server > /dev/null; then
  echo -e "${GREEN}✓ Health endpoint responding${NC}"
else
  # 404 is expected for this endpoint
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT/.well-known/oauth-authorization-server)
  if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ Health endpoint responding (404 expected)${NC}"
  else
    echo -e "${RED}❌ Health endpoint not responding${NC}"
    exit 1
  fi
fi

echo -e "${YELLOW}Step 5: Testing MCP initialize endpoint...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:$TEST_PORT/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }')

if [ -n "$RESPONSE" ]; then
  echo -e "${GREEN}✓ MCP endpoint responding${NC}"
else
  echo -e "${RED}❌ MCP endpoint not responding${NC}"
  exit 1
fi

echo -e "${YELLOW}Step 6: Checking for crashes (5 second stability test)...${NC}"
sleep 5

if ! docker ps | grep -q $CONTAINER_NAME; then
  echo -e "${RED}❌ Container crashed during test!${NC}"
  echo "Container logs:"
  docker logs $CONTAINER_NAME
  exit 1
fi

echo -e "${GREEN}✓ Container stable${NC}"

echo -e "${YELLOW}Step 7: Checking container logs for errors...${NC}"
LOGS=$(docker logs $CONTAINER_NAME 2>&1)

if echo "$LOGS" | grep -q "UnhandledPromiseRejection"; then
  echo -e "${RED}❌ Found unhandled promise rejection in logs!${NC}"
  echo "$LOGS"
  exit 1
fi

if echo "$LOGS" | grep -q "Error:"; then
  echo -e "${YELLOW}⚠️  Found errors in logs (may be expected):${NC}"
  echo "$LOGS" | grep "Error:"
else
  echo -e "${GREEN}✓ No unhandled errors in logs${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All Docker E2E tests passed!${NC}"
echo -e "${GREEN}========================================${NC}"
