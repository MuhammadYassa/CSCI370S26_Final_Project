const { ValidationError } = require('./errors');

const SUPPORTED_ROLES = ['RENTER', 'LANDLORD'];
const SUPPORTED_DISPUTE_TYPES = ['SECURITY_DEPOSIT', 'MAINTENANCE', 'OTHER'];
const SUPPORTED_SECURITY_DEPOSIT_ISSUE_TYPES = [
  'INTEREST_NOT_PAID',
  'TRUST_ACCOUNT_NOT_DISCLOSED',
  'DEPOSIT_NOT_RETURNED_GENERAL',
  'DEPOSIT_NOT_RETURNED_NO_DAMAGE_DISPUTE',
  'WITHHELD_FOR_DAMAGE',
  'WITHHELD_FOR_UNPAID_RENT',
  'SEEKING_MONEY_JUDGMENT'
];
const SUPPORTED_BOROUGHS = [
  'MANHATTAN',
  'BROOKLYN',
  'QUEENS',
  'BRONX',
  'STATEN_ISLAND'
];
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

function normalizeOptionalBoolean(value, fieldName, fields) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'boolean') {
    fields[fieldName] = 'Must be true or false.';
    return null;
  }

  return value;
}

function normalizeOptionalArrayOfStrings(value, fieldName, fields) {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];
  const normalized = values
    .map((item) => normalizeOptionalString(item))
    .filter(Boolean);

  if (normalized.length === 0 && values.length > 0) {
    fields[fieldName] = 'Must contain at least one valid value.';
    return [];
  }

  return normalized;
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

function validateFormAnswersInput(payload) {
  const fields = {};

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError('Please correct the highlighted fields.', {
      answers: 'Answers payload is required.'
    });
  }

  const rawAnswers = payload.answers;
  if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
    throw new ValidationError('Please correct the highlighted fields.', {
      answers: 'Answers must be a JSON object.'
    });
  }

  const answers = { ...rawAnswers };
  const normalizedAnswers = {};

  const dateFields = [
    'dateDemandedReturn',
    'dateComplainedToLandlord',
    'dateOfOccurrence',
    'moveInDate',
    'dateLandlordNotified',
    'relatedCaseNextCourtDate',
    'securityDepositDatePaid'
  ];
  const booleanFields = [
    'attemptedResolution',
    'wantsRepairs',
    'landlordClaimsDamage',
    'landlordClaimsUnpaidRent',
    'heatHotWaterIssue',
    'emergencyCondition',
    'hpdInspectionRequested',
    'relatedCaseExists',
    'confirmationTenantLivesAtProperty',
    'confirmationTenantLivedThereThirtyDays',
    'confirmationTenantHasLeaseOrAgreement',
    'rentControlledOrStabilized',
    'securityDepositInterestReceived',
    'priorCourtProceedings'
  ];
  const arrayFields = ['maintenanceIssueTypes', 'roomsAffected', 'commonAreaIssues', 'formerLandlords'];
  const numericFields = ['mostRecentMonthlyRent'];

  for (const [key, value] of Object.entries(answers)) {
    if (dateFields.includes(key)) {
      normalizedAnswers[key] = parseOptionalDate(value, key, fields);
      continue;
    }

    if (booleanFields.includes(key)) {
      normalizedAnswers[key] = normalizeOptionalBoolean(value, key, fields);
      continue;
    }

    if (arrayFields.includes(key)) {
      normalizedAnswers[key] = normalizeOptionalArrayOfStrings(value, key, fields);
      continue;
    }

    if (numericFields.includes(key)) {
      normalizedAnswers[key] = parseOptionalNonNegativeNumber(value, key, fields);
      continue;
    }

    if (key === 'securityDepositIssueType') {
      const normalizedValue = normalizeOptionalString(value);
      if (
        normalizedValue &&
        !SUPPORTED_SECURITY_DEPOSIT_ISSUE_TYPES.includes(normalizedValue.toUpperCase())
      ) {
        fields[key] = 'Unsupported security deposit issue type.';
      } else {
        normalizedAnswers[key] = normalizedValue ? normalizedValue.toUpperCase() : null;
      }
      continue;
    }

    if (key === 'borough') {
      const normalizedValue = normalizeOptionalString(value);
      if (normalizedValue && !SUPPORTED_BOROUGHS.includes(normalizedValue.toUpperCase())) {
        fields[key] = 'Unsupported borough value.';
      } else {
        normalizedAnswers[key] = normalizedValue ? normalizedValue.toUpperCase() : null;
      }
      continue;
    }

    if (key === 'county') {
      normalizedAnswers[key] = normalizeOptionalString(value);
      continue;
    }

    normalizedAnswers[key] = normalizeOptionalString(value);
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Please correct the highlighted fields.', fields);
  }

  return {
    answers: normalizedAnswers
  };
}

function validateGenerateFormInput(payload) {
  if (!payload || payload.confirmGenerate !== true) {
    throw new ValidationError('Please correct the highlighted fields.', {
      confirmGenerate: 'confirmGenerate must be true.'
    });
  }

  return {
    confirmGenerate: true
  };
}

module.exports = {
  SUPPORTED_DISPUTE_TYPES,
  SUPPORTED_ROLES,
  normalizeEmail,
  normalizeOptionalString,
  validateRegistrationInput,
  validateLoginInput,
  validateCaseInput,
  validateFormAnswersInput,
  validateGenerateFormInput,
  validateDateString
};
