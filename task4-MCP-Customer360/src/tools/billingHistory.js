
const { customers } = require('../data/mockData');
const { validatePhoneNumber } = require('../utils/validators');

async function getBillingHistory(phoneNumber) {
  const phoneValidation = validatePhoneNumber(phoneNumber);
  if (!phoneValidation.success) {
    return {
      success: false,
      error: "Invalid phone number format. Use +1-XXX-XXXX"
    };
  }

  const customer = customers[phoneNumber];
  if (!customer) {
    return {
      success: false,
      error: "Customer not found"
    };
  }

  const totalPaid = customer.billingHistory
    .filter(invoice => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const totalPending = customer.billingHistory
    .filter(invoice => invoice.status === "Pending")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const totalCredits = customer.credits
    .reduce((sum, credit) => sum + credit.amount, 0);

  return {
    success: true,
    data: {
      phoneNumber: phoneNumber,
      customerName: customer.personalInfo.name,
      summary: {
        totalPaid: totalPaid,
        totalPending: totalPending,
        totalCredits: totalCredits,
        accountBalance: totalPending - totalCredits
      },
      billingHistory: customer.billingHistory,
      credits: customer.credits
    }
  };
}

module.exports = { getBillingHistory };