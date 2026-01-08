/**
 * JSON-RPC 2.0 Handler for Telco Call Center MCP Server
 * Implements MCP protocol methods and tool invocations
 */
const { getCustomerInfo } = require('../tools/customerInfo');
const { getLocationInfo } = require('../tools/locationInfo');
const { getBillingHistory } = require('../tools/billingHistory');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// JSON-RPC 2.0 Error Codes
const ErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603
};

// MCP Protocol Methods (as per spec 2025-11-25)
const MCPMethods = {
  INITIALIZE: 'initialize',
  INITIALIZED: 'notifications/initialized',
  TOOLS_LIST: 'tools/list',
  TOOLS_CALL: 'tools/call',
  RESOURCES_LIST: 'resources/list',
  RESOURCES_READ: 'resources/read',
  RESOURCES_TEMPLATES_LIST: 'resources/templates/list',
  PROMPTS_LIST: 'prompts/list',
  PROMPTS_GET: 'prompts/get',
  PING: 'ping'
};

// Tool definitions following MCP schema
const toolDefinitions = [
  {
    name: 'get_customer_info',
    title: 'get_customer_info', // Get Customer Information',
    description: 'Retrieves comprehensive customer information including name, phone lines, device details (IMEI), and billing address. Requires customer phone number and 4-digit password for authentication.',
    inputSchema: {
      type: 'object',
      properties: {
        phoneNumber: {
          type: 'string',
          description: 'Customer phone number in format +1-XXX-XXXX',
          pattern: '^\\+1-\\d{3}-\\d{4}$'
        },
        password: {
          type: 'string',
          description: '4-digit security password',
          pattern: '^\\d{4}$',
          minLength: 4,
          maxLength: 4
        }
      },
      required: ['phoneNumber', 'password']
    },
    outputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        customerId: { type: 'string' },
        accountStatus: { type: 'string' },
        numberOfPhoneLines: { type: 'number' },
        phoneLines: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lineNumber: { type: 'number' },
              phoneNumber: { type: 'string' },
              phoneType: { type: 'string' },
              imei: { type: 'string' },
              plan: { type: 'string' },
              status: { type: 'string' }
            }
          }
        },
        billingAddress: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zipCode: { type: 'string' },
            country: { type: 'string' }
          }
        }
      },
      required: ['name', 'customerId', 'accountStatus', 'numberOfPhoneLines', 'phoneLines', 'billingAddress']
    }
  },
  {
    name: 'get_location_info',
    title: 'get_location_info', // Get Customer Location
    description: 'Identifies the location where the customer is calling from, including city, state, latitude, and longitude coordinates.',
    inputSchema: {
      type: 'object',
      properties: {
        phoneNumber: {
          type: 'string',
          description: 'Customer phone number in format +1-XXX-XXXX',
          pattern: '^\\+1-\\d{3}-\\d{4}$'
        }
      },
      required: ['phoneNumber']
    },
    outputSchema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        lastUpdated: { type: 'string', format: 'date-time' }
      },
      required: ['phoneNumber', 'city', 'state', 'latitude', 'longitude', 'lastUpdated']
    }
  },
  {
    name: 'get_billing_history',
    title: 'get_billing_history', // Get Billing History
    description: 'Retrieves complete billing history including invoices, payment records, credits, and account balance summary.',
    inputSchema: {
      type: 'object',
      properties: {
        phoneNumber: {
          type: 'string',
          description: 'Customer phone number in format +1-XXX-XXXX',
          pattern: '^\\+1-\\d{3}-\\d{4}$'
        }
      },
      required: ['phoneNumber']
    },
    outputSchema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string' },
        customerName: { type: 'string' },
        summary: {
          type: 'object',
          properties: {
            totalPaid: { type: 'number' },
            totalPending: { type: 'number' },
            totalCredits: { type: 'number' },
            accountBalance: { type: 'number' }
          },
          required: ['totalPaid', 'totalPending', 'totalCredits', 'accountBalance']
        },
        billingHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              invoiceId: { type: 'string' },
              billingDate: { type: 'string', format: 'date' },
              dueDate: { type: 'string', format: 'date' },
              amount: { type: 'number' },
              status: { type: 'string' },
              paymentDate: { type: ['string', 'null'], format: 'date' },
              paymentMethod: { type: ['string', 'null'] }
            }
          }
        },
        credits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              creditId: { type: 'string' },
              amount: { type: 'number' },
              reason: { type: 'string' },
              appliedDate: { type: 'string', format: 'date' },
              status: { type: 'string' }
            }
          }
        }
      },
      required: ['phoneNumber', 'customerName', 'summary', 'billingHistory', 'credits']
    }
  }
];

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validators = {
  get_customer_info: ajv.compile(toolDefinitions.find(t => t.name === 'get_customer_info').inputSchema),
  get_location_info: ajv.compile(toolDefinitions.find(t => t.name === 'get_location_info').inputSchema),
  get_billing_history: ajv.compile(toolDefinitions.find(t => t.name === 'get_billing_history').inputSchema)
};

/**
 * Main JSON-RPC 2.0 message handler
 * Processes incoming JSON-RPC requests and returns responses
 */
async function handleJsonRpcMessage(message) {
  const { jsonrpc, id, method, params } = message;

  try {
    // Route to appropriate handler based on method
    switch (method) {
      case MCPMethods.INITIALIZE:
        return handleInitialize(id, params);

      case MCPMethods.PING:
        return handlePing(id);

      case MCPMethods.TOOLS_LIST:
        return handleToolsList(id, params);

      case MCPMethods.TOOLS_CALL:
        return handleToolsCall(id, params);

      case MCPMethods.RESOURCES_LIST:
        return handleResourcesList(id, params);

      case MCPMethods.PROMPTS_LIST:
        return handlePromptsList(id, params);

      default:
        return createErrorResponse(id, ErrorCodes.METHOD_NOT_FOUND, `Method not found: ${method}`);
    }
  } catch (error) {
    console.error('Handler error:', error);
    return createErrorResponse(id, ErrorCodes.INTERNAL_ERROR, error.message);
  }
}

/**
 * Handle initialize method
 * Required first method call to establish connection
 */
function handleInitialize(id, params) {
  return createSuccessResponse(id, {
    protocolVersion: '2025-06-18', // '2025-11-25', Agent service currently supports older version (2025-06-18) ~ update later
    serverInfo: {
      name: 'telco-mcp-customer-info-server',
      title: 'Telco Customer Information MCP Server',
      description: 'MCP Server for Telco Call Center Agent. Uses backend APIs for retrieving customer information, location details, and billing history, exposing them as MCP tools.',
      version: '1.0.0'
    },
    capabilities: {
      tools: {
        listChanged: false
      },
      resources: {},
      prompts: {
      }
    }
  });
}

/**
 * Handle ping method
 * Simple keepalive/health check
 */
function handlePing(id) {
  return createSuccessResponse(id, {});
}

/**
 * Handle tools/list method
 * Returns all available tools the server provides
 */
function handleToolsList(id, params) {
  return createSuccessResponse(id, {
    tools: toolDefinitions
  });
}

/**
 * Handle tools/call method
 * Invokes a specific tool with provided arguments
 */
async function handleToolsCall(id, params) {
  if (!params || !params.name) {
    return createErrorResponse(
      id,
      ErrorCodes.INVALID_PARAMS,
      'Missing required parameter: name'
    );
  }

  const { name, arguments: args } = params;
  console.log(`Invoking tool: ${name} with args:`, args);
  
  const validator = validators[name];
  if (!validator) {
    return createErrorResponse(
      id,
      ErrorCodes.METHOD_NOT_FOUND,
      `Unknown tool: ${name}`
    );
  };

  const validationResult = validator(args);
  if (!validationResult) {
    return createErrorResponse(
      id,
      ErrorCodes.INVALID_PARAMS,
      'Input validation failed',
      { errors: validationResult.errors }
    );
  };

  try {
    let result;

    switch (name) {
      case 'get_customer_info':
        if (!args || !args.phoneNumber || !args.password) {
          return createErrorResponse(
            id,
            ErrorCodes.INVALID_PARAMS,
            'Missing required arguments: phoneNumber and password'
          );
        }
        result = await getCustomerInfo(args.phoneNumber, args.password);
        break;

      case 'get_location_info':
        if (!args || !args.phoneNumber) {
          return createErrorResponse(
            id,
            ErrorCodes.INVALID_PARAMS,
            'Missing required argument: phoneNumber'
          );
        }
        result = await getLocationInfo(args.phoneNumber);
        break;

      case 'get_billing_history':
        if (!args || !args.phoneNumber) {
          return createErrorResponse(
            id,
            ErrorCodes.INVALID_PARAMS,
            'Missing required argument: phoneNumber'
          );
        }
        result = await getBillingHistory(args.phoneNumber);
        break;

      default:
        return createErrorResponse(
          id,
          ErrorCodes.METHOD_NOT_FOUND,
          `Unknown tool: ${name}`
        );
    };

    // Format result according to MCP spec
    if (result.success) {
      return createSuccessResponse(id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.data, null, 2)
          }
        ]
      });
    } 
    else {
      return createErrorResponse(
        id,
        ErrorCodes.INTERNAL_ERROR,
        result.error,
        result
      );
    };
  } 
  catch (error) {
    return createErrorResponse(
      id,
      ErrorCodes.INTERNAL_ERROR,
      error.message
    );
  };
}

/**
 * Handle resources/list method (optional - can be expanded later)
 */
function handleResourcesList(id, params) {
  return createSuccessResponse(id, {
    resources: []
  });
}

/**
 * Handle prompts/list method (optional - can be expanded later)
 */
function handlePromptsList(id, params) {
  return createSuccessResponse(id, {
    prompts: []
  });
}

/**
 * Create JSON-RPC 2.0 success response
 */
function createSuccessResponse(id, result) {
  return {
    jsonrpc: '2.0',
    id: id,
    result: result
  };
}

/**
 * Create JSON-RPC 2.0 error response
 */
function createErrorResponse(id, code, message, data = null) {
  const response = {
    jsonrpc: '2.0',
    id: id,
    error: {
      code: code,
      message: message
    }
  };

  if (data) {
    response.error.data = data;
  };

  return response;
}

module.exports = {
  handleJsonRpcMessage,
  MCPMethods,
  ErrorCodes
};