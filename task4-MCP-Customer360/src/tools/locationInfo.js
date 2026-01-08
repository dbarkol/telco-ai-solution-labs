const { customers } = require('../data/mockData');
const { validatePhoneNumber } = require('../utils/validators');

async function getLocationInfo(phoneNumber) {
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

  return {
    success: true,
    data: {
      phoneNumber: phoneNumber,
      city: customer.location.city,
      state: customer.location.state,
      latitude: customer.location.latitude,
      longitude: customer.location.longitude,
      lastUpdated: customer.location.lastUpdated
    }
  };
}

module.exports = { getLocationInfo };