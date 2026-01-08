const { app } = require('@azure/functions');
const { getTicketDetails } = require('./handlers/fetchTicketById');
const { searchSimilarTickets } = require('./handlers/searchTickets');
const { createServiceTicket } = require('./handlers/createServiceTicket');

app.mcpTool("get_ticket_details", {
  toolName: "get_ticket_details",
  description: "Retrieve details of a customer support ticket by its ID",
  toolProperties: [
    {
      "propertyName": "ticketId",
      "propertyType": "string",
      "description": "Get detailed ticket information based on the unique identifier of the support ticket",
      "isRequired": true,
      "isArray": false
    }
  ],
  handler: async (toolArgs, invocationContext) => {
    const ticketId = invocationContext.triggerMetadata.mcptoolargs.ticketId;
    console.log(`Fetching details for ticket ID: ${ticketId}`);

    // Simulate fetching ticket details from a database or external service
    const ticketDetails = getTicketDetails(ticketId);

    return ticketDetails;
  } 
});

async function fetchTicketDetails(ticketId) {
  // Placeholder for actual data fetching logic
  // In a real implementation, this would query a database or call an external API
  return {
    ticketId: ticketId,
    status: "Open",
    priority: "High",
    createdDate: "2024-06-01T10:00:00Z",
    description: "User is unable to access their account."
  };
}

app.mcpTool("search_tickets", {
  toolName: "search_tickets",
  description: "Retrieve details of a customer support ticket via natural language query",
  toolProperties: [
    {
      "propertyName": "searchQuery",
      "propertyType": "string",
      "description": "The natural language query to search for support tickets",
      "isRequired": true,
      "isArray": false
    }
  ],
  handler: async (toolArgs, invocationContext) => {
    const searchQuery = invocationContext.triggerMetadata.mcptoolargs.searchQuery;
    console.log(`Searching tickets with query: ${searchQuery}`);

    // Simulate searching for similar tickets from a database or external service
    const ticketDetails = searchSimilarTickets(searchQuery);

    return ticketDetails;
  } 
});

app.mcpTool("create_service_ticket", {
  toolName: "create_service_ticket",
  description: "Create a new service ticket in the customer support system",
  toolProperties: [ 
    {
      "propertyName": "customerName",
      "propertyType": "string",
      "description": "Customer's full name",
      "isRequired": true,
      "isArray": false
    },
    {
      "propertyName": "customerPhone",
      "propertyType": "string",
      "description": "Customer's phone number",
      "isRequired": true,
      "isArray": false
    },
    {
      "propertyName": "customerEmail",
      "propertyType": "string",
      "description": "Customer's email address",
      "isRequired": false,
      "isArray": false
    },
    {
      "propertyName": "accountNumber",
      "propertyType": "string",
      "description": "Customer's account number",
      "isRequired": false,
      "isArray": false
    },
    {
      "propertyName": "serviceAddress",
      "propertyType": "string",
      "description": "Service location address",
      "isRequired": false,
      "isArray": false
    },
    {
      "propertyName": "shortDescription",
      "propertyType": "string",
      "description": "Brief problem summary",
      "isRequired": true,
      "isArray": false
    },
    {
      "propertyName": "longDescription",
      "propertyType": "string",
      "description": "Detailed problem description",
      "isRequired": true,
      "isArray": false
    },
    {
      "propertyName": "category",
      "propertyType": "string",
      "description": "Problem category",
      "isRequired": false,
      "isArray": false
    },
    {
      "propertyName": "priority",
      "propertyType": "string",
      "description": "Ticket priority (Low, Medium, High, Critical)",
      "isRequired": false,
      "isArray": false
    }
  ],
  handler: async (toolArgs, invocationContext) => {
    const customerName = invocationContext.triggerMetadata.mcptoolargs.customerName;
    const customerPhone = invocationContext.triggerMetadata.mcptoolargs.customerPhone;
    const customerEmail = invocationContext.triggerMetadata.mcptoolargs.customerEmail || null;
    const accountNumber = invocationContext.triggerMetadata.mcptoolargs.accountNumber || null;
    const serviceAddress = invocationContext.triggerMetadata.mcptoolargs.serviceAddress || null;
    const shortDescription = invocationContext.triggerMetadata.mcptoolargs.shortDescription;
    const longDescription = invocationContext.triggerMetadata.mcptoolargs.longDescription;
    const category = invocationContext.triggerMetadata.mcptoolargs.category || null;
    const priority = invocationContext.triggerMetadata.mcptoolargs.priority || null;

    const ticketData = {
      customerName,
      customerPhone,
      customerEmail,
      accountNumber,
      serviceAddress,
      shortDescription,
      longDescription,
      category,
      priority
    };

    console.log(`Creating service ticket for customer: ${customerName}, Phone: ${customerPhone}`);

    // Simulate creating a new ticket in an external service
    const ticketDetails = createServiceTicket(ticketData);

    return ticketDetails;
  } 
});