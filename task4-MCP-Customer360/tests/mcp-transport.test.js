const request = require('supertest');
const app = require('../src/server');

describe('MCP Streamable HTTP Transport (Spec 2025-11-25)', () => {
  const apiKey = 'demo-api-key-12345';
  const mcpEndpoint = '/mcp';

  describe('Transport Compliance', () => {
    test('POST should accept JSON-RPC messages with proper Accept header', async () => {
      const response = await request(app)
        .post(mcpEndpoint)
        .set('X-API-Key', apiKey)
        .set('Accept', 'application/json, text/event-stream')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.jsonrpc).toBe('2.0');
    });

    test('POST should reject requests without Accept header', async () => {
      const response = await request(app)
        .post(mcpEndpoint)
        .set('X-API-Key', apiKey)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list'
        });

      expect(response.status).toBe(400);
    });

    test('POST should return 202 for notifications', async () => {
      const response = await request(app)
        .post(mcpEndpoint)
        .set('X-API-Key', apiKey)
        .set('Accept', 'application/json, text/event-stream')
        .send({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
          params: {}
        });

      expect(response.status).toBe(202);
    });

    test('GET should return 405 (server does not support server-initiated messages)', async () => {
      const response = await request(app)
        .get(mcpEndpoint)
        .set('X-API-Key', apiKey)
        .set('Accept', 'text/event-stream');

      expect(response.status).toBe(405);
    });
  });

  describe('JSON-RPC Protocol', () => {
    test('should handle initialize method', async () => {
      const response = await request(app)
        .post(mcpEndpoint)
        .set('X-API-Key', apiKey)
        .set('Accept', 'application/json, text/event-stream')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.result.protocolVersion).toBe('2025-11-25');
    });

    test('should handle tools/list method', async () => {
      const response = await request(app)
        .post(mcpEndpoint)
        .set('X-API-Key', apiKey)
        .set('Accept', 'application/json, text/event-stream')
        .send({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.result.tools).toHaveLength(3);
    });

    test('should handle tools/call method', async () => {
      const response = await request(app)
        .post(mcpEndpoint)
        .set('X-API-Key', apiKey)
        .set('Accept', 'application/json, text/event-stream')
        .send({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'get_customer_info',
            arguments: {
              phoneNumber: '+1-555-0001',
              password: '1234'
            }
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.result.content).toBeDefined();
    });
  });
});
