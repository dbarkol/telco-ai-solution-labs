curl -X POST http://localhost:7071/runtime/webhooks/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "create_service_ticket",
      "arguments": {
        "customerName": "John Doe",
        "customerPhone": "+1234567890",
        "customerEmail": "john.doe@example.com",
        "shortDescription": "Internet connectivity issue",
        "longDescription": "Customer reports intermittent internet connectivity over the past 24 hours."
      }
    }
  }'