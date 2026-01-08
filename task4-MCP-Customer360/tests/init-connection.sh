curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-11-25",
      "clientInfo": {
        "name": "telco-callcenter-client",
        "version": "2025-11-25"
      }
    }
  }' | jq '.'
