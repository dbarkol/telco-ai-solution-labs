# Telco Service Desk MCP Server

A fully compliant Model Context Protocol (MCP) server built in Node.js that integrates with customer service helpdesk system (ITSM). 

## 🚀 Features

- ✅ MCP Protocol Version: `2025-11-25`
- 🔧 Transport: Streamable HTTP (POST/GET)
- 📡 Message Format: JSON-RPC 2.0
- 🔐 API Key Authentication
- 🧪 Mock Data for Demo Purposes

## MCP Protocol Compliance

- **Protocol Version**: 2025-11-25
- **Transport**: Streamable HTTP
- **Message Format**: JSON-RPC 2.0
- **Specification**: https://modelcontextprotocol.io/specification

## 📘 MCP Endpoint

All JSON-RPC messages must be sent to the Azure Function App MCP endpoint

```bash
POST https://{function-app-name}.azurewebsites.net/runtime/webhooks/mcp
```


## Supported Methods

- initialize - Establish connection and negotiate capabilities
- tools/list - List all available tools
- tools/call - Invoke a specific tool
- ping - Keepalive/health check

## 📦 Tools Exposed

The server exposes the following tools via JSON-RPC:

1. **search_tickets** 
   
   Retrieve details of a customer support ticket via natural language query
   - Requires: `searchQuery` (string) The problem description to search for

2. **get_ticket_details**

   Get detailed ticket information based on the unique identifier of the support ticket  
   - Requires: `ticketId` (string) Unique ID of a service ticket

3. **create_service_ticket**

   Create a new service ticket in the customer support system  
   - Requires: `customerName` (string), `customerPhone` (string), shortDescription (string), longDescription (string) 
   - Optional: `customerEmail` (string), `accountNumber` (string), category (string), priority (string: Low, Medium, High, Critical)

## Example Usage
MCP Server URI points to local Azure Function Tools Runtime.

If you are targeting the Azure Function App, substitute with Function App URL.  See URI below.

```bash
https://{function-appname}.azurewebsites.net/runtime/webhooks/mcp
```

### Initialize Connection

```bash
curl -X POST http://localhost:7071/runtime/webhooks/mcp \
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

### Search Tickets

```bash
curl -X POST http://localhost:7071/runtime/webhooks/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "search_tickets",
      "arguments": {
        "searchQuery": "customer internet keeps dropping"
      }
    }
  }'
```

### Get Service Ticket Details

```bash
curl -X POST http://localhost:7071/runtime/webhooks/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "get_ticket_details",
      "arguments": {
        "ticketId": "TKT-2024-007234"
      }
    }
  }'
```

## Create a Service Ticket

```bash
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
```