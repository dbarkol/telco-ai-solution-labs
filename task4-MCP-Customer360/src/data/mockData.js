// Mock customer database with realistic Telco data
const customers = {
  "+1-555-0001": {
    password: "1234",
    personalInfo: {
      name: "John Anderson",
      customerId: "CUST-10001",
      accountStatus: "Active",
      billingAddress: {
        street: "123 Main Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
        country: "USA"
      }
    },
    phoneLines: [
      {
        lineNumber: 1,
        phoneNumber: "+1-555-0001",
        phoneType: "iPhone 14 Pro",
        imei: "353456789012345",
        plan: "Unlimited Premium",
        status: "Active"
      },
      {
        lineNumber: 2,
        phoneNumber: "+1-555-0002",
        phoneType: "Samsung Galaxy S23",
        imei: "353456789012346",
        plan: "Family Share",
        status: "Active"
      }
    ],
    location: {
      city: "San Francisco",
      state: "CA",
      latitude: 37.7749,
      longitude: -122.4194,
      lastUpdated: new Date().toISOString()
    },
    billingHistory: [
      {
        invoiceId: "INV-2024-001",
        billingDate: "2024-12-01",
        dueDate: "2024-12-15",
        amount: 189.99,
        status: "Paid",
        paymentDate: "2024-12-10",
        paymentMethod: "Credit Card"
      },
      {
        invoiceId: "INV-2024-002",
        billingDate: "2024-11-01",
        dueDate: "2024-11-15",
        amount: 189.99,
        status: "Paid",
        paymentDate: "2024-11-08",
        paymentMethod: "Auto-Pay"
      }
    ],
    credits: [
      {
        creditId: "CR-2024-001",
        amount: 25.00,
        reason: "Service interruption credit",
        appliedDate: "2024-11-15",
        status: "Applied"
      }
    ]
  },
  "+1-555-0100": {
    password: "5678",
    personalInfo: {
      name: "Sarah Martinez",
      customerId: "CUST-10002",
      accountStatus: "Active",
      billingAddress: {
        street: "456 Oak Avenue",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        country: "USA"
      }
    },
    phoneLines: [
      {
        lineNumber: 1,
        phoneNumber: "+1-555-0100",
        phoneType: "Google Pixel 8",
        imei: "353456789012347",
        plan: "Business Unlimited",
        status: "Active"
      }
    ],
    location: {
      city: "Austin",
      state: "TX",
      latitude: 30.2672,
      longitude: -97.7431,
      lastUpdated: new Date().toISOString()
    },
    billingHistory: [
      {
        invoiceId: "INV-2024-003",
        billingDate: "2024-12-01",
        dueDate: "2024-12-15",
        amount: 95.99,
        status: "Pending",
        paymentDate: null,
        paymentMethod: null
      }
    ],
    credits: []
  }
};

module.exports = { customers };
