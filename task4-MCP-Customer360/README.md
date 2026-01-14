# Use Case Description

## Context

A telecommunications company has deployed an AI agent that assists customer service representatives in answering questions using **Retrieval-Augmented Generation (RAG)** over internal knowledge bases.  
The company wants to extend this AI agent’s capabilities to support:

- 360-degree customer information retrieval (view) 
- Real-time location information  
- Billing history access  

These capabilities enable agents to resolve customer issues efficiently while remaining within the AI assistant conversation flow.

## Business Problem

Customer service agents require rapid, consolidated access to customer profile, geographic, and billing information while staying engaged in a single conversational interface with the AI agent.  
Switching between multiple systems disrupts workflow and slows issue resolution.

## Solution

Build an **MCP (Model Context Protocol) server** that exposes comprehensive **Customer-360 data** via standardized MCP tools.

The AI agent can invoke these tools using natural language queries such as:

- “Retrieve complete customer information for phone number xxx-xxx-xxxx and password xxxx”
- “Retrieve billing or current location data for a customer with phone number xxx-xxx-xxxx”

All interactions occur within the same conversational interface without navigating external systems.

## Value Proposition

- **Faster resolution** using unified Customer-360 data via MCP tools  
- **Reduced handle time** by eliminating system switching  
- **Consistent experience** through validated inputs and streaming updates (SSE)  
- **Higher agent focus** on customer engagement rather than navigation

## Scope & Requirements

Implement an MCP server prototype that exposes **three JSON-RPC 2.0 tools** over **Streamable HTTP**.  
Each tool must implement the following functionality.

## Tool 1: Get Customer Information

### Purpose
Retrieve full and complete **Customer-360** information from internal data sources.

### Functionality Requirements
- Accept a natural language search query  
- Validate phone number and PIN  

### Input Parameters
- `phoneNumber` (string)  
- `pinCode` (string, 4 digits)  

### Output Structure
Returns a complete customer profile including:
- Name  
- Email  
- Phone lines  
- IMEI(s)  
- Billing address  

### Error Handling
- Error response if incorrect phone number or PIN is provided

## Tool 2: Get Customer’s Current Location

### Purpose
Retrieve the customer’s real-time or last-known location.

### Functionality Requirements
- Accept phone number as input  
- Return complete location information for the subscriber’s phone line  

### Input Parameters
- `phoneNumber` (string)  

### Output Structure
Returns:
- Phone line number  
- State  
- City  
- Latitude  
- Longitude  

### Error Handling
- Error response if phone number is invalid

## Tool 3: Get Customer Billing Information

### Purpose
Retrieve the customer’s complete billing history.

### Functionality Requirements
- Accept phone number as input  
- Return full billing details for the subscriber account  

### Input Parameters
- `phoneNumber` (string)  

### Output Structure
Returns:
- Monthly invoices  
- Payments  
- Credits  
- Current outstanding balance (if any)

## Technical Requirements

### Implementation
- The MCP server can be implemented in any programming language (your choice):
  - Python  
  - NodeJS  
  - Java  
  - C#  
- Functions/tools should be implemented as **standalone modules** for extensibility  
- Helper functions kept internal to each module  
- All data exchanged in **JSON format**

### Mock Data Specifications

- Minimum **two customers** in the mock customer database  
- Multiple phone lines per customer  
- Multiple historical invoices per customer  
- Customer location data may be:
  - Stored separately to simulate real-time data  
  - Or stored within the same data structure  
- Same flexibility applies to billing data

### Data Structures

For this hackathon, a single JSON-based data structure may be used to store:
- Customer profile data  
- Billing data  
- Location data

### Modularity

- MCP server implemented as a **separate module**  
- Designed as a reusable template for MCP servers across different domains  
- Modules should remain **loosely coupled** with no hard dependencies  
- MCP server should be easily pluggable into **Microsoft Foundry**  
- Mock data should be easily replaceable with real backend API calls

## Success Criteria

### Demonstration & Integration Readiness

#### End-to-End Flow
✅ Demonstrate retrieving complete customer information  
✅ Demonstrate retrieving customer’s current location  
✅ Demonstrate retrieving customer billing information to answer a billing-related question  

#### Integration Preparedness
✅ Mock data clearly separated and replaceable with backend API calls
