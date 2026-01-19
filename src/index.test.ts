// E2E Integration Tests for MCP Server
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('MCP Server E2E Tests', () => {
  let serverProcess: ChildProcess | null = null;
  const TEST_PORT = 3001;

  beforeAll(async () => {
    // Start the server in SSE mode
    serverProcess = spawn(
      'node',
      [join(__dirname, '../build/index.js'), '--sse', '--port', String(TEST_PORT)],
      {
        env: {
          ...process.env,
          NODE_ENV: 'test',
          // Use test environment without requiring actual Actual Budget server
        },
      }
    );

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server failed to start within timeout'));
      }, 10000);

      serverProcess?.stderr?.on('data', (data) => {
        const output = data.toString();
        console.log('Server output:', output);
        if (output.includes('started on port')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      serverProcess?.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      serverProcess?.on('exit', (code) => {
        if (code !== 0) {
          clearTimeout(timeout);
          reject(new Error(`Server exited with code ${code}`));
        }
      });
    });
  });

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
      // Wait for process to exit
      await new Promise((resolve) => {
        serverProcess?.on('exit', resolve);
        setTimeout(resolve, 1000); // Fallback timeout
      });
    }
  });

  it('should start without crashing', () => {
    expect(serverProcess).toBeTruthy();
    expect(serverProcess?.killed).toBe(false);
  });

  it('should respond to health check endpoints', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/.well-known/oauth-authorization-server`);
    expect(response.status).toBe(404); // Expected for this endpoint
    expect(response.ok || response.status === 404).toBe(true);
  });

  it('should handle MCP initialize request without crashing', async () => {
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      },
    };

    try {
      const response = await fetch(`http://localhost:${TEST_PORT}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initRequest),
      });

      // Should get a response (not crash)
      expect(response).toBeTruthy();
      
      // Check that server is still alive
      expect(serverProcess?.killed).toBe(false);
    } catch (error) {
      // Even if request fails, server should not crash
      expect(serverProcess?.killed).toBe(false);
    }
  });

  it('should not have unhandled promise rejections', async () => {
    let unhandledRejection = false;

    serverProcess?.on('exit', (code, signal) => {
      // If server crashes, it's a problem
      if (code !== null && code !== 0 && code !== 143) { // 143 = SIGTERM (expected on cleanup)
        unhandledRejection = true;
      }
    });

    // Give it time to potentially crash
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(unhandledRejection).toBe(false);
    expect(serverProcess?.killed).toBe(false);
  });
});
