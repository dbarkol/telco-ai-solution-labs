
// getTicketDetails.js

/**
 * Retrieves detailed information for a specific service ticket
 * @param {string} ticketId - The unique ticket identifier
 * @returns {Object} Complete ticket details including notes, status, and technician information
 */
function getTicketDetails(ticketId) {
  // Mock ticket database
  const ticketDatabase = {
    "TKT-2024-006789": {
      ticketId: "TKT-2024-006789",
      status: "Completed",
      priority: "High",
      category: "Connectivity",
      subcategory: "Internet Outage",
      
      customer: {
        customerId: "CUST-445821",
        name: "Jennifer Williams",
        phoneNumber: "+1-555-0142",
        email: "jennifer.williams@email.com",
        accountNumber: "ACC-998877",
        serviceAddress: "1245 Maple Street, Springfield, IL 62701",
        serviceType: "Fiber 500Mbps"
      },
      
      problemDescription: {
        short: "Complete internet outage since morning",
        long: "Customer reports no internet connectivity since 7:00 AM today. All indicator lights on ONT are green except for the 'Internet' light which is red. Customer has tried power cycling the equipment twice with no improvement. Home office worker - business critical."
      },
      
      timestamps: {
        created: "2024-12-20T07:15:32Z",
        firstResponse: "2024-12-20T07:28:10Z",
        assigned: "2024-12-20T07:45:00Z",
        inProgress: "2024-12-20T08:30:15Z",
        resolved: "2024-12-20T10:15:40Z",
        closed: "2024-12-20T10:45:00Z"
      },
      
      sla: {
        responseTime: "15 minutes",
        resolutionTime: "4 hours",
        responseTimeMet: true,
        resolutionTimeMet: true,
        actualResponseTime: "12 minutes",
        actualResolutionTime: "3 hours"
      },
      
      assignedTechnicians: [
        {
          technicianId: "TECH-1547",
          name: "Michael Torres",
          role: "Field Technician Level 2",
          phoneNumber: "+1-555-0198",
          assignedDate: "2024-12-20T07:45:00Z",
          primaryTechnician: true
        },
        {
          technicianId: "TECH-2103",
          name: "Amy Chen",
          role: "Network Engineer",
          phoneNumber: "+1-555-0203",
          assignedDate: "2024-12-20T09:10:00Z",
          primaryTechnician: false
        }
      ],
      
      technicianNotes: [
        {
          noteId: "NOTE-001",
          technicianId: "TECH-1547",
          technicianName: "Michael Torres",
          timestamp: "2024-12-20T08:35:22Z",
          noteType: "Initial Assessment",
          content: "Arrived on site at 08:30. Confirmed ONT status lights - Internet LED solid red, all others green. Checked physical connections - all secure. Performed ONT reboot - no change. Signal levels from fiber appear normal. Suspect issue upstream of ONT. Escalating to network operations."
        },
        {
          noteId: "NOTE-002",
          technicianId: "TECH-2103",
          technicianName: "Amy Chen",
          timestamp: "2024-12-20T09:15:47Z",
          noteType: "Network Diagnosis",
          content: "Reviewed network topology and monitoring systems. Identified fiber cut on trunk line serving this sector (Maple Street area). Caused by construction crew at 6:45 AM. Repair crew dispatched. ETA 30 minutes. Approximately 47 customers affected in this area. Customer notification sent."
        },
        {
          noteId: "NOTE-003",
          technicianId: "TECH-1547",
          technicianName: "Michael Torres",
          timestamp: "2024-12-20T10:05:18Z",
          noteType: "Work in Progress",
          content: "Fiber splice repair completed by emergency crew. Testing connectivity... ONT Internet light now green. Running speed test from customer's laptop: Download 487 Mbps, Upload 512 Mbps. Performance within spec. Monitoring for stability - 5 minutes elapsed, connection stable."
        },
        {
          noteId: "NOTE-004",
          technicianId: "TECH-1547",
          technicianName: "Michael Torres",
          timestamp: "2024-12-20T10:18:33Z",
          noteType: "Resolution",
          content: "Issue resolved. Connection stable for 15 minutes. All customer devices reconnected successfully (3 laptops, 2 phones, 1 tablet, smart TV). Explained root cause to customer. Apologized for inconvenience. Customer satisfied with resolution. Provided direct contact number for follow-up if needed within 24 hours. Ticket ready for closure."
        }
      ],
      
      resolutionDetails: {
        rootCause: "Fiber optic cable severed by third-party construction crew on trunk line",
        actionTaken: "Emergency fiber splice repair performed by network infrastructure team",
        verified: true,
        verificationMethod: "On-site speed test and 15-minute stability monitoring",
        customerSatisfaction: "Satisfied",
        followUpRequired: false
      },
      
      relatedTickets: [
        "TKT-2024-006790",
        "TKT-2024-006791",
        "TKT-2024-006792"
      ],
      
      internalComments: [
        {
          commentId: "CMT-001",
          author: "Supervisor - Rachel Anderson",
          timestamp: "2024-12-20T09:30:00Z",
          content: "Mass outage event. Customer communication template activated. Prioritizing business customers for updates."
        }
      ],
      
      attachments: [
        {
          attachmentId: "ATT-001",
          fileName: "ont_status_photo.jpg",
          fileType: "image/jpeg",
          uploadedBy: "TECH-1547",
          uploadedDate: "2024-12-20T08:37:15Z",
          fileSize: "2.4 MB"
        },
        {
          attachmentId: "ATT-002",
          fileName: "speed_test_results.pdf",
          fileType: "application/pdf",
          uploadedBy: "TECH-1547",
          uploadedDate: "2024-12-20T10:07:30Z",
          fileSize: "156 KB"
        }
      ]
    },
    
    "TKT-2024-007234": {
      ticketId: "TKT-2024-007234",
      status: "Fix Being Applied",
      priority: "Medium",
      category: "Equipment",
      subcategory: "Router Malfunction",
      
      customer: {
        customerId: "CUST-332156",
        name: "Robert Chen",
        phoneNumber: "+1-555-0189",
        email: "r.chen@email.com",
        accountNumber: "ACC-776543",
        serviceAddress: "892 Oak Avenue, Portland, OR 97201",
        serviceType: "Cable 200Mbps"
      },
      
      problemDescription: {
        short: "Router keeps rebooting randomly",
        long: "Customer reports WiFi router restarts on its own 3-4 times daily. Pattern noticed over past week. Each reboot causes 5-minute service interruption. Customer working from home - causing significant disruption to video calls."
      },
      
      timestamps: {
        created: "2024-12-19T14:22:18Z",
        firstResponse: "2024-12-19T14:35:45Z",
        assigned: "2024-12-19T15:10:00Z",
        inProgress: "2024-12-19T16:20:30Z",
        resolved: null,
        closed: null
      },
      
      sla: {
        responseTime: "30 minutes",
        resolutionTime: "24 hours",
        responseTimeMet: true,
        resolutionTimeMet: null,
        actualResponseTime: "13 minutes",
        actualResolutionTime: "In Progress"
      },
      
      assignedTechnicians: [
        {
          technicianId: "TECH-1892",
          name: "Kevin Walsh",
          role: "Field Technician Level 1",
          phoneNumber: "+1-555-0221",
          assignedDate: "2024-12-19T15:10:00Z",
          primaryTechnician: true
        }
      ],
      
      technicianNotes: [
        {
          noteId: "NOTE-001",
          technicianId: "TECH-1892",
          technicianName: "Kevin Walsh",
          timestamp: "2024-12-19T16:25:40Z",
          noteType: "Initial Assessment",
          content: "Contacted customer via phone for remote troubleshooting. Reviewed router logs - detected overheating events correlating with reboot timestamps. Router model WR-3200 (known issue with this batch). Ambient temperature normal. Checked for firmware updates - customer on latest version. Recommended router replacement. Scheduling on-site visit for tomorrow."
        },
        {
          noteId: "NOTE-002",
          technicianId: "TECH-1892",
          technicianName: "Kevin Walsh",
          timestamp: "2024-12-20T09:45:12Z",
          noteType: "Work in Progress",
          content: "On-site visit in progress. Confirmed router running hot (measured 68°C vs normal 45°C). Ventilation appears adequate. Device manufacturing defect suspected. Installing replacement router model WR-3500 (upgraded model). Transferring configuration settings. Testing in progress."
        }
      ],
      
      resolutionDetails: {
        rootCause: "Hardware defect in router causing overheating and automatic safety reboots",
        actionTaken: "Router replacement with upgraded model in progress",
        verified: false,
        verificationMethod: "24-hour monitoring period required",
        customerSatisfaction: "Pending",
        followUpRequired: true
      },
      
      relatedTickets: [],
      
      internalComments: [
        {
          commentId: "CMT-001",
          author: "Equipment Manager - Tom Russell",
          timestamp: "2024-12-19T17:00:00Z",
          content: "WR-3200 batch 2024-Q2 has elevated defect rate. Consider proactive replacement campaign for remaining deployed units."
        }
      ],
      
      attachments: []
    },
    
    "TKT-2024-008101": {
      ticketId: "TKT-2024-008101",
      status: "Issue Identified",
      priority: "Low",
      category: "Billing",
      subcategory: "Charge Dispute",
      
      customer: {
        customerId: "CUST-221847",
        name: "Sandra Martinez",
        phoneNumber: "+1-555-0167",
        email: "sandra.m@email.com",
        accountNumber: "ACC-445122",
        serviceAddress: "567 Pine Road, Austin, TX 78701",
        serviceType: "DSL 50Mbps"
      },
      
      problemDescription: {
        short: "Unexpected equipment charge on bill",
        long: "Customer questions $89.99 equipment charge on December bill. States she returned old modem to retail location on Nov 15 as instructed during service upgrade. Has receipt showing return was processed."
      },
      
      timestamps: {
        created: "2024-12-18T11:40:22Z",
        firstResponse: "2024-12-18T12:05:33Z",
        assigned: "2024-12-18T13:20:00Z",
        inProgress: "2024-12-18T14:15:45Z",
        resolved: null,
        closed: null
      },
      
      sla: {
        responseTime: "2 hours",
        resolutionTime: "48 hours",
        responseTimeMet: true,
        resolutionTimeMet: null,
        actualResponseTime: "25 minutes",
        actualResolutionTime: "In Progress"
      },
      
      assignedTechnicians: [
        {
          technicianId: "TECH-3401",
          name: "Patricia Lewis",
          role: "Billing Specialist",
          phoneNumber: "+1-555-0245",
          assignedDate: "2024-12-18T13:20:00Z",
          primaryTechnician: true
        }
      ],
      
      technicianNotes: [
        {
          noteId: "NOTE-001",
          technicianId: "TECH-3401",
          technicianName: "Patricia Lewis",
          timestamp: "2024-12-18T14:20:18Z",
          noteType: "Investigation",
          content: "Reviewed customer account and return records. Customer returned modem model DM-150 (Serial: DM150-88234) to Austin Central retail location on 11/15/2024 at 2:34 PM. Return receipt confirmed. However, equipment return was not properly logged in billing system - clerk error suspected. Charge applied automatically after 30-day unreturned equipment period. Customer complaint valid."
        },
        {
          noteId: "NOTE-002",
          technicianId: "TECH-3401",
          technicianName: "Patricia Lewis",
          timestamp: "2024-12-19T10:10:55Z",
          noteType: "Action Plan",
          content: "Initiating credit reversal for $89.99 equipment charge. Processing refund to customer account - will appear on next billing cycle (Jan statement). Sending confirmation email to customer. Flagging retail location for staff retraining on proper return processing procedures. Adding note to prevent future auto-charges for this equipment serial number."
        }
      ],
      
      resolutionDetails: {
        rootCause: "Equipment return not properly recorded in billing system due to retail location clerk error",
        actionTaken: "Credit reversal initiated; staff retraining scheduled for retail location",
        verified: true,
        verificationMethod: "Return receipt validation and system audit",
        customerSatisfaction: "Pending",
        followUpRequired: true
      },
      
      relatedTickets: [],
      
      internalComments: [
        {
          commentId: "CMT-001",
          author: "Retail Operations Manager - James Porter",
          timestamp: "2024-12-19T11:00:00Z",
          content: "Austin Central location has had 3 similar incidents this month. Scheduling mandatory refresher training for all staff on return processing. Implementing double-check procedure."
        }
      ],
      
      attachments: [
        {
          attachmentId: "ATT-001",
          fileName: "return_receipt_11-15-2024.pdf",
          fileType: "application/pdf",
          uploadedBy: "Customer",
          uploadedDate: "2024-12-18T11:42:00Z",
          fileSize: "245 KB"
        }
      ]
    }
  };

  // Check if ticket exists
  if (!ticketDatabase[ticketId]) {
    return {
      success: false,
      error: "Ticket not found",
      message: `No ticket found with ID: ${ticketId}`,
      timestamp: new Date().toISOString()
    };
  }

  // Return ticket details
  return {
    success: true,
    timestamp: new Date().toISOString(),
    ticket: ticketDatabase[ticketId]
  };
}

module.exports = { getTicketDetails };