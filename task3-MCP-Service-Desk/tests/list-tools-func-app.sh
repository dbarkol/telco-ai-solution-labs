curl -X POST https://{function-app}.azurewebsites.net/runtime/webhooks/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/list",
    "params": {
    }
  }'
