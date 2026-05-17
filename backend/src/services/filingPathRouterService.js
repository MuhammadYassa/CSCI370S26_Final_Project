const { LEGAL_FORM_CATALOG, NYC_BOROUGHS } = require('../config/legalFormCatalog');
const { firstNonEmpty, includesAnyKeyword, normalizeTextForSearch } = require('../utils/formData');

function isNewYorkState(context) {
  return normalizeTextForSearch(context.state) === 'ny';
}

function isNYCBorough(value) {
  return NYC_BOROUGHS.includes(String(value || '').trim().toUpperCase());
}

function isNYCContext(context) {
  if (isNYCBorough(context.borough)) {
    return true;
  }

  const county = String(context.county || '').trim().toUpperCase();
  if (
    county &&
    ['NEW YORK', 'KINGS', 'QUEENS', 'BRONX', 'RICHMOND'].includes(county)
  ) {
    return true;
  }

  const possibleNYCStrings = [
    context.city,
    context.propertyAddress,
    context.defendantAddress,
    context.landlordAddress,
    context.defendantCity
  ]
    .filter(Boolean)
    .join(' ');

  return includesAnyKeyword(possibleNYCStrings, [
    'new york city',
    'nyc',
    'manhattan',
    'brooklyn',
    'queens',
    'bronx',
    'staten island'
  ]);
}

function inferSecurityDepositIssueType(context) {
  if (context.securityDepositIssueType) {
    return context.securityDepositIssueType;
  }

  const description = context.disputeDescription || '';

  if (includesAnyKeyword(description, ['interest', 'trust account', 'bank account'])) {
    return 'INTEREST_NOT_PAID';
  }

  if (
    includesAnyKeyword(description, [
      'damage',
      'repair cost',
      'deducted',
      'unpaid rent',
      'small claims',
      'withheld because'
    ])
  ) {
    return 'WITHHELD_FOR_DAMAGE';
  }

  return null;
}

function inferMaintenanceSignal(context) {
  if (context.wantsRepairs === true) {
    return true;
  }

  if (Array.isArray(context.maintenanceIssueTypes) && context.maintenanceIssueTypes.length > 0) {
    return true;
  }

  return includesAnyKeyword(context.disputeDescription, [
    'no heat',
    'hot water',
    'leak',
    'mold',
    'pests',
    'repair',
    'unsafe',
    'maintenance'
  ]);
}

function inferDisputeType(context) {
  const explicitDisputeType = String(context.disputeType || '').trim().toUpperCase();
  if (explicitDisputeType === 'SECURITY_DEPOSIT' || explicitDisputeType === 'MAINTENANCE') {
    return explicitDisputeType;
  }

  const issueType = inferSecurityDepositIssueType(context);
  if (issueType) {
    return 'SECURITY_DEPOSIT';
  }

  if (inferMaintenanceSignal(context)) {
    return 'MAINTENANCE';
  }

  return explicitDisputeType || 'OTHER';
}

function determineFilingPath(context) {
  const disputeType = inferDisputeType(context);
  const securityDepositIssueType = inferSecurityDepositIssueType(context);
  const isNY = isNewYorkState(context);
  const isNYC = isNYCContext(context);
  const amountRequested = Number(context.amountRequested);
  const amountRequestedMissing =
    context.amountRequested === undefined ||
    context.amountRequested === null ||
    context.amountRequested === '';

  if (
    disputeType === 'SECURITY_DEPOSIT' &&
    isNY &&
    [
      'INTEREST_NOT_PAID',
      'TRUST_ACCOUNT_NOT_DISCLOSED',
      'DEPOSIT_NOT_RETURNED_GENERAL',
      'DEPOSIT_NOT_RETURNED_NO_DAMAGE_DISPUTE'
    ].includes(securityDepositIssueType)
  ) {
    return {
      ...LEGAL_FORM_CATALOG.NY_OAG_RENT_SECURITY_COMPLAINT,
      reasonSelected:
        'The dispute is a New York security deposit complaint involving interest, trust account disclosure, or general non-return issues, so the Attorney General complaint form is the supported MVP filing path.'
    };
  }

  if (
    disputeType === 'SECURITY_DEPOSIT' &&
    isNY &&
    [
      'WITHHELD_FOR_DAMAGE',
      'WITHHELD_FOR_UNPAID_RENT',
      'SEEKING_MONEY_JUDGMENT'
    ].includes(securityDepositIssueType) &&
    (amountRequestedMissing || (Number.isFinite(amountRequested) && amountRequested <= 10000)) &&
    isNYC
  ) {
    return {
      ...LEGAL_FORM_CATALOG.NYC_SMALL_CLAIMS_SECURITY_DEPOSIT_CIV_SC_50,
      reasonSelected:
        'The renter is seeking return of a security deposit through a supported New York City small claims path involving damage, unpaid rent, or a money judgment request.'
    };
  }

  if (disputeType === 'MAINTENANCE' && isNY && isNYC && inferMaintenanceSignal(context)) {
    return {
      ...LEGAL_FORM_CATALOG.NYC_HP_ACTION_REPAIRS_PACKET,
      reasonSelected:
        'The dispute concerns New York City repairs, habitability, or essential services, so the supported MVP filing path is the Housing Court repairs petition.'
    };
  }

  return {
    ...LEGAL_FORM_CATALOG.UNSUPPORTED_FORM_TYPE,
    reasonSelected:
      'The current case details do not match any supported official filing path for the MVP.'
  };
}

module.exports = {
  determineFilingPath,
  inferMaintenanceSignal,
  inferSecurityDepositIssueType,
  inferDisputeType,
  isNYCContext
};
