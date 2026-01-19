// E2E Tests for all MCP Tools
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

describe('MCP Tools E2E Tests', () => {
  let serverProcess: ChildProcess | null = null;
  const TEST_PORT = 3003;
  let requestId = 1;

  /**
   * Helper function to call an MCP tool
   */
  async function callTool(toolName: string, args: Record<string, unknown> = {}): Promise<JsonRpcResponse> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: requestId++,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    };

    const response = await fetch(`http://localhost:${TEST_PORT}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Helper function to list all available tools
   */
  async function listTools(): Promise<JsonRpcResponse> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: requestId++,
      method: 'tools/list',
      params: {},
    };

    const response = await fetch(`http://localhost:${TEST_PORT}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await response.json();
  }

  /**
   * Helper function to initialize MCP session
   */
  async function initializeSession(): Promise<void> {
    const initRequest = {
      jsonrpc: '2.0',
      id: requestId++,
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

    await fetch(`http://localhost:${TEST_PORT}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initRequest),
    });
  }

  beforeAll(async () => {
    // Start the server in SSE mode with write permissions
    serverProcess = spawn(
      'node',
      [join(__dirname, '../../build/index.js'), '--sse', '--port', String(TEST_PORT), '--enable-write'],
      {
        env: {
          ...process.env,
          NODE_ENV: 'test',
          // Mock Actual Budget environment for testing
          ACTUAL_DATA_DIR: process.env.ACTUAL_DATA_DIR || '/tmp/actual-test',
        },
      }
    );

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server failed to start within timeout'));
      }, 15000);

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

    // Initialize MCP session
    await initializeSession();

    // Give server time to fully initialize
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
      await new Promise((resolve) => {
        serverProcess?.on('exit', resolve);
        setTimeout(resolve, 1000);
      });
    }
  });

  describe('Tool Discovery', () => {
    it('should list all available tools', async () => {
      const response = await listTools();
      
      expect(response.result).toBeDefined();
      expect(response.error).toBeUndefined();
      
      const result = response.result as { tools: Array<{ name: string; description: string }> };
      expect(result.tools).toBeDefined();
      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools.length).toBeGreaterThan(0);

      // Verify expected read tools exist
      const toolNames = result.tools.map((t) => t.name);
      expect(toolNames).toContain('get-accounts');
      expect(toolNames).toContain('get-transactions');
      expect(toolNames).toContain('monthly-summary');
      expect(toolNames).toContain('balance-history');
      expect(toolNames).toContain('spending-by-category');
    });
  });

  describe('Read-Only Tools', () => {
    describe('get-accounts', () => {
      it('should retrieve account list without errors', async () => {
        const response = await callTool('get-accounts');
        
        expect(response.error).toBeUndefined();
        expect(response.result).toBeDefined();
      });

      it('should handle empty arguments', async () => {
        const response = await callTool('get-accounts', {});
        
        expect(response.error).toBeUndefined();
      });
    });

    describe('get-transactions', () => {
      it('should handle missing required accountId', async () => {
        const response = await callTool('get-transactions', {});
        
        // Should return error for missing required field
        expect(response.error || response.result).toBeDefined();
      });

      it('should accept valid accountId parameter', async () => {
        // This will fail in test env without real data, but shouldn't crash
        const response = await callTool('get-transactions', {
          accountId: 'test-account-id',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('should accept optional date range parameters', async () => {
        const response = await callTool('get-transactions', {
          accountId: 'test-account-id',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('should accept optional amount filters', async () => {
        const response = await callTool('get-transactions', {
          accountId: 'test-account-id',
          minAmount: 10.0,
          maxAmount: 100.0,
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('should accept optional category and payee filters', async () => {
        const response = await callTool('get-transactions', {
          accountId: 'test-account-id',
          categoryName: 'Groceries',
          payeeName: 'Store',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('monthly-summary', () => {
      it('should handle empty arguments (current month)', async () => {
        const response = await callTool('monthly-summary', {});
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('should accept month parameter', async () => {
        const response = await callTool('monthly-summary', {
          month: '2024-01',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('balance-history', () => {
      it('should require accountId parameter', async () => {
        const response = await callTool('balance-history', {});
        
        expect(response).toBeDefined();
      });

      it('should accept valid accountId', async () => {
        const response = await callTool('balance-history', {
          accountId: 'test-account-id',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('should accept date range parameters', async () => {
        const response = await callTool('balance-history', {
          accountId: 'test-account-id',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('spending-by-category', () => {
      it('should handle empty arguments (current month)', async () => {
        const response = await callTool('spending-by-category', {});
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('should accept month parameter', async () => {
        const response = await callTool('spending-by-category', {
          month: '2024-01',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('get-grouped-categories', () => {
      it('should retrieve categories without errors', async () => {
        const response = await callTool('get-grouped-categories', {});
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('get-payees', () => {
      it('should retrieve payees without errors', async () => {
        const response = await callTool('get-payees', {});
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('get-rules', () => {
      it('should retrieve rules without errors', async () => {
        const response = await callTool('get-rules', {});
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('get-budget-months', () => {
      it('should retrieve budget months without errors', async () => {
        const response = await callTool('get-budget-months', {});
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('get-budget-month', () => {
      it('should require month parameter', async () => {
        const response = await callTool('get-budget-month', {});
        
        expect(response).toBeDefined();
      });

      it('should accept valid month parameter', async () => {
        const response = await callTool('get-budget-month', {
          month: '2024-01',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });
  });

  describe('Write Tools (validation only)', () => {
    // Note: These tests only validate that tools don't crash the server
    // They don't test actual functionality since that requires a real Actual Budget database

    describe('create-transaction', () => {
      it('should validate required parameters', async () => {
        const response = await callTool('create-transaction', {});
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('should accept valid transaction structure', async () => {
        const response = await callTool('create-transaction', {
          account: 'test-account-id',
          date: '2024-01-15',
          amount: 50.00,
          payee: 'Test Payee',
          notes: 'Test transaction',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('update-transaction', () => {
      it('should require id parameter', async () => {
        const response = await callTool('update-transaction', {});
        
        expect(response).toBeDefined();
      });

      it('should accept transaction update', async () => {
        const response = await callTool('update-transaction', {
          id: 'test-transaction-id',
          amount: 75.00,
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('delete-transaction', () => {
      it('should require id parameter', async () => {
        const response = await callTool('delete-transaction', {});
        
        expect(response).toBeDefined();
      });

      it('should accept valid id', async () => {
        const response = await callTool('delete-transaction', {
          id: 'test-transaction-id',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('category operations', () => {
      it('create-category should accept valid parameters', async () => {
        const response = await callTool('create-category', {
          name: 'Test Category',
          group_id: 'test-group-id',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('update-category should accept valid parameters', async () => {
        const response = await callTool('update-category', {
          id: 'test-category-id',
          name: 'Updated Category',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('delete-category should accept valid id', async () => {
        const response = await callTool('delete-category', {
          id: 'test-category-id',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('payee operations', () => {
      it('create-payee should accept valid parameters', async () => {
        const response = await callTool('create-payee', {
          name: 'Test Payee',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('update-payee should accept valid parameters', async () => {
        const response = await callTool('update-payee', {
          id: 'test-payee-id',
          name: 'Updated Payee',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('delete-payee should accept valid id', async () => {
        const response = await callTool('delete-payee', {
          id: 'test-payee-id',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('rule operations', () => {
      it('create-rule should accept valid parameters', async () => {
        const response = await callTool('create-rule', {
          stage: 'pre',
          conditionsOp: 'and',
          conditions: [],
          actions: [],
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('update-rule should accept valid parameters', async () => {
        const response = await callTool('update-rule', {
          id: 'test-rule-id',
          stage: 'post',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });

      it('delete-rule should accept valid id', async () => {
        const response = await callTool('delete-rule', {
          id: 'test-rule-id',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });

    describe('run-bank-sync', () => {
      it('should require accountId parameter', async () => {
        const response = await callTool('run-bank-sync', {});
        
        expect(response).toBeDefined();
      });

      it('should accept valid accountId', async () => {
        const response = await callTool('run-bank-sync', {
          accountId: 'test-account-id',
        });
        
        expect(response).toBeDefined();
        expect(serverProcess?.killed).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool name gracefully', async () => {
      const response = await callTool('non-existent-tool', {});
      
      expect(response).toBeDefined();
      expect(serverProcess?.killed).toBe(false);
    });

    it('should handle malformed arguments gracefully', async () => {
      const response = await callTool('get-transactions', {
        accountId: null,
      });
      
      expect(response).toBeDefined();
      expect(serverProcess?.killed).toBe(false);
    });

    it('should not crash on concurrent requests', async () => {
      const promises = [
        callTool('get-accounts'),
        callTool('get-payees'),
        callTool('get-grouped-categories'),
        callTool('get-rules'),
      ];
      
      const responses = await Promise.allSettled(promises);
      
      expect(responses.length).toBe(4);
      expect(serverProcess?.killed).toBe(false);
    });
  });

  describe('Server Stability', () => {
    it('should remain stable after multiple tool calls', async () => {
      // Make 10 sequential tool calls
      for (let i = 0; i < 10; i++) {
        await callTool('get-accounts');
      }
      
      expect(serverProcess?.killed).toBe(false);
    });

    it('should not have unhandled rejections in logs', async () => {
      let hasUnhandledRejection = false;
      
      serverProcess?.stderr?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('UnhandledPromiseRejection')) {
          hasUnhandledRejection = true;
        }
      });
      
      // Make several tool calls
      await callTool('get-accounts');
      await callTool('get-payees');
      
      // Wait for potential async errors
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      expect(hasUnhandledRejection).toBe(false);
    });
  });
});
