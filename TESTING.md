# Testing Guide

This document describes the testing strategy and how to run tests for the Actual Budget MCP Server.

## Test Types

### 1. Unit Tests
Fast, isolated tests for individual functions and modules.

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:unit:watch

# Run with coverage report
npm run test:coverage

# Open interactive test UI
npm run test:ui
```

**Coverage**: 136 tests across core functionality, tools, and utilities.

### 2. E2E Tests
Integration tests that start the actual server and test real HTTP requests.

```bash
# Run server E2E tests
npm run test:e2e

# Run tool E2E tests (tests all 26 MCP tools)
npm run test:e2e:tools

# Run all tests (unit + E2E + tool E2E)
npm run test:all
```

**Server E2E tests**:
- Server starts without crashing
- HTTP endpoints respond correctly
- MCP protocol initialization
- No unhandled promise rejections

**Tool E2E tests** (comprehensive coverage of all 26 MCP tools):
- Tool discovery and listing
- All read-only tools (10 tools):
  - get-accounts, get-transactions, monthly-summary
  - balance-history, spending-by-category
  - get-grouped-categories, get-payees, get-rules
  - get-budget-months, get-budget-month
- All write tools (16 tools):
  - Transaction operations (create, update, delete)
  - Category operations (create, update, delete, groups)
  - Payee operations (create, update, delete)
  - Rule operations (create, update, delete)
  - Bank sync operations
- Parameter validation
- Error handling (invalid tools, malformed args)
- Concurrent request handling
- Server stability under load

### 3. Docker E2E Tests
Full container tests that validate the Docker image before deployment.

```bash
# Run Docker container tests
npm run docker:test
```

**What it tests**:
- Docker image builds successfully
- Container starts and runs stably
- No crashes during initialization
- HTTP endpoints work in container
- MCP initialization works
- Log scanning for errors
- 5-second stability test

## CI/CD Testing

All tests run automatically in GitHub Actions:

### Pull Request Validation
Every PR triggers:
- ✅ Unit tests with coverage
- ✅ Type checking
- ✅ Linting and formatting
- ✅ Server E2E tests
- ✅ Tool E2E tests (all 26 MCP tools)
- ✅ Docker container tests

### Pre-Release Testing
Before creating a release, run:
```bash
# Full test suite
npm run test:all

# Docker validation
npm run docker:test

# Quality checks
npm run quality
```

## Test Structure

```
actual-budget-mcp/
├── src/
│   ├── **/*.test.ts               # Unit tests (co-located with source)
│   ├── index.test.ts              # Server E2E tests
│   └── tools/tools.e2e.test.ts    # Tool E2E tests (all 26 tools)
└── test-docker.sh                 # Docker E2E test script
```

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from './my-module.js';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle errors', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### E2E Test Guidelines
- Test critical paths (server startup, initialization)
- Check for unhandled rejections
- Verify container stability
- Scan logs for errors

## Debugging Failed Tests

### Unit Test Failures
```bash
# Run specific test file
npx vitest run src/path/to/test.test.ts

# Debug with UI
npm run test:ui
```

### E2E Test Failures
Check the server output in the test logs for:
- Unhandled promise rejections
- Connection errors
- Port conflicts

### Docker Test Failures
```bash
# Check container logs
docker logs actual-mcp-e2e-test

# Run container manually for debugging
docker run -p 3002:3000 actual-mcp:e2e-test --sse --port 3000
```

## Test Best Practices

1. **Always run tests before committing**
   ```bash
   npm run quality && npm test
   ```

2. **Run E2E tests before releases**
   ```bash
   npm run test:all
   ```

3. **Test Docker image before pushing**
   ```bash
   npm run docker:test
   ```

4. **Add tests for new features**
   - Unit tests for logic
   - E2E tests for new endpoints
   - Update Docker tests if needed

## Continuous Testing

The project uses GitHub Actions to run tests automatically:
- **On PR**: All tests run (unit, E2E, Docker, quality)
- **On push to main**: Security scans + scheduled tests
- **Daily**: Scheduled test runs to catch regressions

## Test Coverage Goals

- **Unit tests**: ≥ 80% coverage
- **E2E tests**: All critical paths covered
- **Docker tests**: Container stability verified
- **Zero unhandled rejections**: Strict enforcement
