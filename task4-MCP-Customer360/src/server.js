/**
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { authenticateApiKey } = require('./middleware/auth');
const { handleJsonRpcMessage } = require('./jsonrpc/handler');
const { createSSEStream } = require('./sse/stream');

const app = express();
const PORT = process.env.PORT || 3000;
const MCP_ENDPOINT = process.env.MCP_ENDPOINT || '/mcp';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Telco MCP Server',
    version: '1.0.4',  // Set the version every time you release
    protocol: 'MCP 2025-11-25',
    transport: 'Streamable HTTP (JSON-RPC 2.0 + SSE)',
    mcpEndpoint: MCP_ENDPOINT,
    features: ['ajv-validation', 'sse-streaming'],
    timestamp: new Date().toISOString()
  });
});

// MCP Protocol Information Endpoint (optional - for discovery)
app.get('/', (req, res) => {
  res.json({
    protocolVersion: '2025-11-25',
    serverInfo: {
      name: 'telco-callcenter-mcp-server',
      version: '1.0.4'
    },
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
      sse: true
    },
    transport: 'Streamable HTTP',
    mcpEndpoint: MCP_ENDPOINT,
    methods: [
      'initialize',
      'tools/list',
      'tools/call',
      'resources/list',
      'prompts/list',
      'ping'
    ],
    authentication: 'API Key (X-API-Key header)',
    features: {
      inputValidation: 'AJV JSON Schema Validator',
      streaming: 'Streaming HTTP (SSE)'
    }
  });
});

// ============================================================================
// MCP ENDPOINT - Streamable HTTP Transport (Specification 2025-11-25)
// ============================================================================

/**
 * POST to MCP endpoint: Client sends JSON-RPC messages to server
 * Supports both immediate JSON responses and SSE streaming based on Accept header
 */
app.post(MCP_ENDPOINT, authenticateApiKey, async (req, res) => {
  console.log('MCP POST request received');

  try {
    // Check Accept header
    const acceptHeader = req.get('Accept') || '';
    const acceptsJson = acceptHeader.includes('application/json');
    const acceptsSSE = acceptHeader.includes('text/event-stream');

    if (!acceptsJson && !acceptsSSE) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32600,
          message: 'Invalid Request: Accept header must include application/json or text/event-stream'
        }
      });
    };

    const jsonRpcMessage = req.body;
    console.log('Received JSON-RPC message:', JSON.stringify(jsonRpcMessage));

    // Validate JSON-RPC 2.0 format
    if (!jsonRpcMessage.jsonrpc || jsonRpcMessage.jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: jsonRpcMessage.id || null,
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc field must be "2.0"'
        }
      });
    };

    // Determine message type
    const isRequest = jsonRpcMessage.method && jsonRpcMessage.id !== undefined;
    const isNotification = jsonRpcMessage.method && jsonRpcMessage.id === undefined;
    const isResponse = jsonRpcMessage.result !== undefined || jsonRpcMessage.error !== undefined;

    // Handle responses and notifications (202 Accepted, no body)
    if (isResponse || isNotification) {
      return res.status(202).send();
    };
    console.log('Processing JSON-RPC request...');

    // Handle requests
    if (isRequest) {
      // Client prefers SSE streaming
      if (acceptsSSE && !acceptsJson) {
        console.log('Client prefers SSE streaming response');

        return createSSEStream(req, res, jsonRpcMessage);
      };

      // Client accepts both or prefers JSON - return immediate JSON response
      const response = await handleJsonRpcMessage(jsonRpcMessage);
      res.setHeader('Content-Type', 'application/json');

      console.log('Sending JSON-RPC response:', JSON.stringify(response));
      return res.json(response);
    };

    // Invalid message
    return res.status(400).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32600,
        message: 'Invalid Request: message must be a JSON-RPC request, notification, or response'
      }
    });

  } 
  catch (error) {
    console.error('MCP POST Endpoint Error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32603,
        message: 'Internal server error',
        data: error.message
      }
    });
  };
});

/**
 * GET to MCP endpoint: SSE stream for server-initiated messages and streaming responses
 * Clients can open persistent SSE connection to receive streamed responses
 */
app.get(MCP_ENDPOINT, authenticateApiKey, (req, res) => {
  console.log('SSE connection requested by client');

  // Check if client accepts SSE
  const acceptHeader = req.get('Accept') || '';
  if (!acceptHeader.includes('text/event-stream')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Accept header must include text/event-stream for GET requests'
    });
  }

  // Setup SSE connection
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in nginx

  // Send initial connection confirmation
  res.write('event: connected\n');
  res.write(`data: ${JSON.stringify({
    message: 'SSE connection established',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Keep connection alive with periodic pings
  const pingInterval = setInterval(() => {
    res.write('event: ping\n');
    res.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
  }, 30000); // Every 30 seconds

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(pingInterval);
    res.end();
  });

  // Note: In this implementation, we use POST for request-response
  // GET is kept open for potential server-initiated messages
  // For a full implementation, you'd store this connection and use it to push
  // notifications or progress updates from long-running tools
});

// 404 handler
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint does not exist. MCP endpoint is: ${MCP_ENDPOINT}`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Telco MCP Server is running on port ${PORT}`);
  console.log(`📋 MCP Protocol Version: 2025-11-25`);
  console.log(`🔗 MCP Endpoint: http://localhost:${PORT}${MCP_ENDPOINT}`);
  console.log(`📡 SSE Support: Enabled`);
  console.log(`✅ Input Validation: AJV`);
  console.log(`🔐 Authentication: Use X-API-Key header with value: demo-api-key-12345`);
  console.log(`📖 Server Info: http://localhost:${PORT}/`);
});

module.exports = app;