curl -X POST https://telco-mcp-server.whiteground-1e998745.westus2.azurecontainerapps.io/mcp \
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
