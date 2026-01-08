curl -X POST https://telco-mcp-server.whiteground-1e998745.westus2.azurecontainerapps.io/mcp \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_customer_info",
      "arguments": {
        "phoneNumber": "+1-555-0001",
        "password": "1234"
      }
    }
  }' | jq '.'
