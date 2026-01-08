const { customers } = require('../data/mockData');
const { validatePhoneNumber, validatePassword } = require('../utils/validators.js');

async function getCustomerInfo(phoneNumber, password) {
  // Validate inputs
  const phoneValidation = validatePhoneNumber(phoneNumber);
  if (!phoneValidation.success) {
    return {
      success: false,
      error: "Invalid phone number format. Use +1-XXX-XXXX"
    };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.success) {
    return {
      success: false,
      error: "Invalid password format. Must be 4 digits"
    };
  }

  // Check if customer exists
  const customer = customers[phoneNumber];
  if (!customer) {
    return {
      success: false,
      error: "Customer not found"
    };
  }

  // Verify password
  if (customer.password !== password) {
    return {
      success: false,
      error: "Incorrect password"
    };
  }

  // Return customer information
  return {
    success: true,
    data: {
      name: customer.personalInfo.name,
      customerId: customer.personalInfo.customerId,
      accountStatus: customer.personalInfo.accountStatus,
      numberOfPhoneLines: customer.phoneLines.length,
      phoneLines: customer.phoneLines.map(line => ({
        lineNumber: line.lineNumber,
        phoneNumber: line.phoneNumber,
        phoneType: line.phoneType,
        imei: line.imei,
        plan: line.plan,
        status: line.status
      })),
      billingAddress: customer.personalInfo.billingAddress
    }
  };
}

module.exports = { getCustomerInfo };