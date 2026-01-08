curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "get_billing_history",
      "arguments": {
        "phoneNumber": "+1-555-0001"
      }
    }
  }' | jq '.'
