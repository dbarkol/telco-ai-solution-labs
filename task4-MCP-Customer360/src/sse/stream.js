
const { handleJsonRpcMessage } = require('../jsonrpc/handler');

/**
 * Create an SSE stream for a JSON-RPC request
 * Streams the response as Server-Sent Events
 */
async function createSSEStream(req, res, jsonRpcMessage) {
  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    // Send start event
    res.write('event: start\n');
    res.write(`data: ${JSON.stringify({
      id: jsonRpcMessage.id,
      method: jsonRpcMessage.method,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Process the JSON-RPC message
    const response = await handleJsonRpcMessage(jsonRpcMessage);

    // Send the response as an SSE event
    res.write('event: message\n');
    res.write(`data: ${JSON.stringify(response)}\n\n`);

    // Send completion event
    res.write('event: complete\n');
    res.write(`data: ${JSON.stringify({
      id: jsonRpcMessage.id,
      timestamp: new Date().toISOString()
    })}\n\n`);
  } 
  catch (error) {
    console.error('SSE Stream Error:', error);

    // Send error event
    res.write('event: error\n');
    res.write(`data: ${JSON.stringify({
      jsonrpc: '2.0',
      id: jsonRpcMessage.id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    })}\n\n`);
  };
  // Close the stream
  res.end();
}

/**
 * Stream progress updates for long-running operations
 * This can be used to send incremental updates during tool execution
 */
function streamProgress(res, id, progress) {
  res.write('event: progress\n');
  res.write(`data: ${JSON.stringify({
    id: id,
    progress: progress,
    timestamp: new Date().toISOString()
  })}\n\n`);
}

module.exports = {
  createSSEStream,
  streamProgress
};