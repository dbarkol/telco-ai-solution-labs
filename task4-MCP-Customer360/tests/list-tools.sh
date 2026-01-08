# curl -X POST http://localhost:3000/mcp \
curl -X POST https://telco-mcp-server.whiteground-1e998745.westus2.azurecontainerapps.io/mcp \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' | jq '.'
