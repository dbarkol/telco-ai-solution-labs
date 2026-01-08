const { z } = require('zod');

const phoneNumberSchema = z.string()
  .regex(/^\+1-\d{3}-\d{4}$/, "Phone number must be in format +1-XXX-XXXX");

const passwordSchema = z.string()
  .length(4, "Password must be exactly 4 digits")
  .regex(/^\d{4}$/, "Password must contain only digits");

function validatePhoneNumber(phoneNumber) {
  return phoneNumberSchema.safeParse(phoneNumber);
}

function validatePassword(password) {
  return passwordSchema.safeParse(password);
}

module.exports = {
  validatePhoneNumber,
  validatePassword
};