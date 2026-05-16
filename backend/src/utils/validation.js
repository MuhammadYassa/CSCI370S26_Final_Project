const { ValidationError } = require('./errors');

const SUPPORTED_ROLES = ['RENTER', 'LANDLORD'];
const SUPPORTED_DISPUTE_TYPES = ['SECURITY_DEPOSIT', 'MAINTENANCE', 'OTHER'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function validateDateString(value) {
  if (!DATE_PATTERN.test(String(value))) {
    return false;
  }

  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseOptionalNonNegativeNumber(value, fieldName, fields) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    fields[fieldName] = 'Must be a valid non-negative number.';
    return null;
  }

  return numericValue;
}

function parseOptionalDate(value, fieldName, fields) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (!validateDateString(value)) {
    fields[fieldName] = 'Must be a valid date in YYYY-MM-DD format.';
    return null;
  }

  return value;
}

function validateRegistrationInput(payload) {
  const fields = {};
  const fullName = normalizeOptionalString(payload.fullName);
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === 'string' ? payload.password : '';
  const role = String(payload.role || '').trim().toUpperCase();

  if (!fullName) {
    fields.fullName = 'Full name is required.';
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    fields.email = 'Valid email is required.';
  }

  if (!password) {
    fields.password = 'Password is required.';
  }

  if (!SUPPORTED_ROLES.includes(role)) {
    fields.role = 'Role must be RENTER or LANDLORD.';
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Please correct the highlighted fields.', fields);
  }

  return {
    fullName,
    email,
    password,
    role
  };
}

function validateLoginInput(payload) {
  const fields = {};
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!email || !EMAIL_PATTERN.test(email)) {
    fields.email = 'Valid email is required.';
  }

  if (!password) {
    fields.password = 'Password is required.';
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Please correct the highlighted fields.', fields);
  }

  return {
    email,
    password
  };
}

function validateCaseInput(payload) {
  const fields = {};

  const renterFullName = normalizeOptionalString(payload.renterFullName);
  const renterEmail = normalizeEmail(payload.renterEmail);
  const renterPhone = normalizeOptionalString(payload.renterPhone);
  const landlordFullName = normalizeOptionalString(payload.landlordFullName);
  const landlordEmail = normalizeEmail(payload.landlordEmail);
  const landlordPhone = normalizeOptionalString(payload.landlordPhone);
  const propertyAddress = normalizeOptionalString(payload.propertyAddress);
  const city = normalizeOptionalString(payload.city);
  const state = normalizeOptionalString(payload.state);
  const zipCode = normalizeOptionalString(payload.zipCode);
  const disputeType = String(payload.disputeType || '').trim().toUpperCase();
  const disputeDescription = normalizeOptionalString(payload.disputeDescription);
  const evidenceDescription = normalizeOptionalString(payload.evidenceDescription);

  if (!renterFullName) {
    fields.renterFullName = 'Renter full name is required.';
  }

  if (!renterEmail || !EMAIL_PATTERN.test(renterEmail)) {
    fields.renterEmail = 'Valid renter email is required.';
  }

  if (!landlordFullName) {
    fields.landlordFullName = 'Landlord full name is required.';
  }

  if (!landlordEmail || !EMAIL_PATTERN.test(landlordEmail)) {
    fields.landlordEmail = 'Valid landlord email is required.';
  }

  if (!propertyAddress) {
    fields.propertyAddress = 'Property address is required.';
  }

  if (!state) {
    fields.state = 'State is required.';
  }

  if (!SUPPORTED_DISPUTE_TYPES.includes(disputeType)) {
    fields.disputeType = 'Dispute type must be SECURITY_DEPOSIT, MAINTENANCE, or OTHER.';
  }

  if (!disputeDescription) {
    fields.disputeDescription = 'Dispute description is required.';
  }

  const securityDepositAmount = parseOptionalNonNegativeNumber(
    payload.securityDepositAmount,
    'securityDepositAmount',
    fields
  );
  const amountRequested = parseOptionalNonNegativeNumber(
    payload.amountRequested,
    'amountRequested',
    fields
  );
  const leaseStartDate = parseOptionalDate(payload.leaseStartDate, 'leaseStartDate', fields);
  const leaseEndDate = parseOptionalDate(payload.leaseEndDate, 'leaseEndDate', fields);
  const moveOutDate = parseOptionalDate(payload.moveOutDate, 'moveOutDate', fields);

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Please correct the highlighted fields.', fields);
  }

  return {
    renterFullName,
    renterEmail,
    renterPhone,
    landlordFullName,
    landlordEmail,
    landlordPhone,
    propertyAddress,
    city,
    state,
    zipCode,
    disputeType,
    securityDepositAmount,
    amountRequested,
    leaseStartDate,
    leaseEndDate,
    moveOutDate,
    disputeDescription,
    evidenceDescription
  };
}

module.exports = {
  SUPPORTED_DISPUTE_TYPES,
  SUPPORTED_ROLES,
  normalizeEmail,
  normalizeOptionalString,
  validateRegistrationInput,
  validateLoginInput,
  validateCaseInput
};
