# Telco Customer360 MCP Server

A fully compliant Model Context Protocol (MCP) server built in Node.js for Telco call center agent use cases. This server implements the MCP specification version **2025-11-25**, using **Streamable HTTP** transport and **JSON-RPC 2.0** message format.

## 🚀 Features

- ✅ MCP Protocol Version: `2025-11-25`
- 🔧 Transport: Streamable HTTP (POST/GET)
- 📡 Message Format: JSON-RPC 2.0
- 🔐 API Key Authentication
- 🧪 Mock Data for Demo Purposes
- 🐳 Docker-Ready for Containerized Deployment

## MCP Protocol Compliance

- **Protocol Version**: 2025-11-25
- **Transport**: Streamable HTTP
- **Message Format**: JSON-RPC 2.0
- **Specification**: https://modelcontextprotocol.io/specificat

## 📘 MCP Endpoint

All JSON-RPC messages must be sent to the MCP endpoint
```bash
POST http://localhost:3000/mcp
```

### Required Headers
```http
X-API-Key: demo-api-key-12345
Content-Type: application/json
Accept: application/json, text/event-stream
```

## Supported Methods

- initialize - Establish connection and negotiate capabilities
- tools/list - List all available tools
- tools/call - Invoke a specific tool
- ping - Keepalive/health check

## 📦 Tools Exposed

The server exposes three tools via JSON-RPC:

1. **get_customer_info**

   - Retrieves customer details including name, phone lines, IMEI numbers, and billing address.  
   Requires: `phoneNumber`, `password` (4-digit)

2. **get_location_info**

   - Identifies the customer's location (city, latitude, longitude).  
   Requires: `phoneNumber`

3. **get_billing_history**

   - Retrieves billing history, payments, and credits.  
   Requires: `phoneNumber`

## Example Usage

### Initialize Connection

```bash
curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
  }'
```

### List Tools

```bash
curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
```

### Get Customer Info

```bash
curl -X POST http://localhost:3000/mcp \
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
  }'
```
