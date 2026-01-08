
// createServiceTicket.js

/**
 * Creates a new service ticket in the system
 * @param {Object} ticketData - Ticket creation parameters
 * @param {string} ticketData.customerName - Customer's full name
 * @param {string} ticketData.customerPhone - Customer's phone number
 * @param {string} ticketData.customerEmail - Customer's email address (optional)
 * @param {string} ticketData.accountNumber - Customer's account number (optional)
 * @param {string} ticketData.serviceAddress - Service location address (optional)
 * @param {string} ticketData.shortDescription - Brief problem summary
 * @param {string} ticketData.longDescription - Detailed problem description
 * @param {string} ticketData.category - Problem category (optional)
 * @param {string} ticketData.priority - Ticket priority (optional: Low, Medium, High, Critical)
 * @returns {Object} Created ticket details including ticket number
 */
function createServiceTicket(ticketData) {
  // Validate required fields
  const requiredFields = ['customerName', 'customerPhone', 'shortDescription', 'longDescription'];
  const missingFields = requiredFields.filter(field => !ticketData[field]);
  
  if (missingFields.length > 0) {
    return {
      success: false,
      error: "Missing required fields",
      missingFields: missingFields,
      timestamp: new Date().toISOString()
    };
  }

  // Generate unique ticket ID
  const ticketId = generateTicketId();
  
  // Determine priority based on keywords if not provided
  const priority = ticketData.priority || determinePriority(ticketData.shortDescription, ticketData.longDescription);
  
  // Determine category based on problem description if not provided
  const category = ticketData.category || categorizeIssue(ticketData.shortDescription, ticketData.longDescription);
  
  // Simulate customer lookup (in real system, would query customer database)
  const customerInfo = enrichCustomerData(ticketData);
  
  // Create timestamp
  const createdTimestamp = new Date().toISOString();
  
  // Determine SLA based on priority
  const slaDetails = calculateSLA(priority);
  
  // Auto-assign based on category and priority (in real system, would use routing rules)
  const assignedTechnician = autoAssignTechnician(category, priority);
  
  // Create the ticket object
  const newTicket = {
    ticketId: ticketId,
    status: "In-Review",
    priority: priority,
    category: category.main,
    subcategory: category.sub,
    
    customer: {
      customerId: customerInfo.customerId,
      name: ticketData.customerName,
      phoneNumber: ticketData.customerPhone,
      email: ticketData.customerEmail || customerInfo.email,
      accountNumber: ticketData.accountNumber || customerInfo.accountNumber,
      serviceAddress: ticketData.serviceAddress || customerInfo.serviceAddress,
      serviceType: customerInfo.serviceType
    },
    
    problemDescription: {
      short: ticketData.shortDescription,
      long: ticketData.longDescription
    },
    
    timestamps: {
      created: createdTimestamp,
      firstResponse: null,
      assigned: createdTimestamp,
      inProgress: null,
      resolved: null,
      closed: null
    },
    
    sla: {
      responseTime: slaDetails.responseTime,
      resolutionTime: slaDetails.resolutionTime,
      responseDeadline: slaDetails.responseDeadline,
      resolutionDeadline: slaDetails.resolutionDeadline
    },
    
    assignedTechnicians: [assignedTechnician],
    
    technicianNotes: [],
    
    channel: "AI Agent",
    createdBy: "Customer Service Representative",
    
    notifications: {
      customerNotificationSent: true,
      notificationMethod: "SMS",
      notificationTimestamp: createdTimestamp,
      message: `Your service ticket ${ticketId} has been created. We'll contact you within ${slaDetails.responseTime}.`
    }
  };

  // Return success response with ticket details
  return {
    success: true,
    message: "Service ticket created successfully",
    timestamp: createdTimestamp,
    ticket: newTicket,
    customerMessage: `Thank you for contacting us. Your service ticket number is ${ticketId}. We will respond within ${slaDetails.responseTime}. You will receive updates via ${newTicket.notifications.notificationMethod} at ${ticketData.customerPhone}.`
  };
}

// Helper: Generate unique ticket ID
function generateTicketId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit random number
  return `TKT-${year}-${randomNum}`;
}

// Helper: Determine priority based on problem description
function determinePriority(shortDesc, longDesc) {
  const combinedText = (shortDesc + " " + longDesc).toLowerCase();
  
  // Critical priority keywords
  if (combinedText.match(/no service|complete outage|emergency|business down|cannot work/i)) {
    return "Critical";
  }
  
  // High priority keywords
  if (combinedText.match(/outage|not working|no internet|no connection|urgent/i)) {
    return "High";
  }
  
  // Low priority keywords
  if (combinedText.match(/billing|question|inquiry|slow|intermittent/i)) {
    return "Low";
  }
  
  // Default to Medium
  return "Medium";
}

// Helper: Categorize issue based on description
function categorizeIssue(shortDesc, longDesc) {
  const combinedText = (shortDesc + " " + longDesc).toLowerCase();
  
  if (combinedText.match(/internet|connection|connectivity|wifi|wireless|online/i)) {
    return { main: "Connectivity", sub: "Internet Issues" };
  }
  
  if (combinedText.match(/phone|call|landline|dial tone|voice/i)) {
    return { main: "Voice Services", sub: "Phone Issues" };
  }
  
  if (combinedText.match(/router|modem|equipment|device|hardware/i)) {
    return { main: "Equipment", sub: "Device Malfunction" };
  }
  
  if (combinedText.match(/bill|billing|charge|payment|invoice/i)) {
    return { main: "Billing", sub: "Account Issues" };
  }
  
  if (combinedText.match(/tv|television|cable|channel|streaming/i)) {
    return { main: "TV Services", sub: "Service Issues" };
  }
  
  if (combinedText.match(/speed|slow|performance|bandwidth/i)) {
    return { main: "Performance", sub: "Speed Issues" };
  }
  
  // Default category
  return { main: "General", sub: "Customer Inquiry" };
}

// Helper: Enrich customer data (simulates customer database lookup)
function enrichCustomerData(ticketData) {
  // In real system, would query customer database
  // For prototype, generate mock data
  return {
    customerId: `CUST-${Math.floor(Math.random() * 900000) + 100000}`,
    email: ticketData.customerEmail || `${ticketData.customerName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    accountNumber: ticketData.accountNumber || `ACC-${Math.floor(Math.random() * 900000) + 100000}`,
    serviceAddress: ticketData.serviceAddress || "Address on file",
    serviceType: "Fiber 300Mbps" // Mock service type
  };
}

// Helper: Calculate SLA deadlines based on priority
function calculateSLA(priority) {
  const now = new Date();
  let responseMinutes, resolutionHours;
  
  switch (priority) {
    case "Critical":
      responseMinutes = 15;
      resolutionHours = 2;
      break;
    case "High":
      responseMinutes = 30;
      resolutionHours = 4;
      break;
    case "Medium":
      responseMinutes = 60;
      resolutionHours = 24;
      break;
    case "Low":
      responseMinutes = 120;
      resolutionHours = 48;
      break;
    default:
      responseMinutes = 60;
      resolutionHours = 24;
  }
  
  const responseDeadline = new Date(now.getTime() + responseMinutes * 60000);
  const resolutionDeadline = new Date(now.getTime() + resolutionHours * 3600000);
  
  return {
    responseTime: `${responseMinutes} minutes`,
    resolutionTime: `${resolutionHours} hours`,
    responseDeadline: responseDeadline.toISOString(),
    resolutionDeadline: resolutionDeadline.toISOString()
  };
}

// Helper: Auto-assign technician based on category and priority
function autoAssignTechnician(category, priority) {
  // Mock technician pool
  const technicianPool = {
    "Connectivity": [
      { technicianId: "TECH-1001", name: "Alex Johnson", role: "Network Technician Level 2", phoneNumber: "+1-555-0301" },
      { technicianId: "TECH-1002", name: "Maria Garcia", role: "Network Technician Level 2", phoneNumber: "+1-555-0302" }
    ],
    "Voice Services": [
      { technicianId: "TECH-2001", name: "David Kim", role: "Voice Services Specialist", phoneNumber: "+1-555-0401" },
      { technicianId: "TECH-2002", name: "Lisa Anderson", role: "Voice Services Specialist", phoneNumber: "+1-555-0402" }
    ],
    "Equipment": [
      { technicianId: "TECH-3001", name: "Carlos Rodriguez", role: "Field Technician Level 1", phoneNumber: "+1-555-0501" },
      { technicianId: "TECH-3002", name: "Emily White", role: "Field Technician Level 1", phoneNumber: "+1-555-0502" }
    ],
    "Billing": [
      { technicianId: "TECH-4001", name: "Sharon Davis", role: "Billing Specialist", phoneNumber: "+1-555-0601" },
      { technicianId: "TECH-4002", name: "Mohammed Hassan", role: "Billing Specialist", phoneNumber: "+1-555-0602" }
    ],
    "TV Services": [
      { technicianId: "TECH-5001", name: "Jennifer Lee", role: "TV Services Technician", phoneNumber: "+1-555-0701" }
    ],
    "Performance": [
      { technicianId: "TECH-1001", name: "Alex Johnson", role: "Network Technician Level 2", phoneNumber: "+1-555-0301" }
    ],
    "General": [
      { technicianId: "TECH-6001", name: "Robert Taylor", role: "Customer Support Specialist", phoneNumber: "+1-555-0801" }
    ]
  };
  
  // Get technicians for category
  const availableTechs = technicianPool[category.main] || technicianPool["General"];
  
  // Random assignment (in real system, would use workload balancing)
  const selectedTech = availableTechs[Math.floor(Math.random() * availableTechs.length)];
  
  return {
    ...selectedTech,
    assignedDate: new Date().toISOString(),
    primaryTechnician: true
  };
}

module.exports = { createServiceTicket };