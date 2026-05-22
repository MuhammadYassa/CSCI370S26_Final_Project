const SECURITY_DEPOSIT_OPTIONS = [
  ['INTEREST_NOT_PAID', 'Interest not paid'],
  ['TRUST_ACCOUNT_NOT_DISCLOSED', 'Trust account not disclosed'],
  ['DEPOSIT_NOT_RETURNED_GENERAL', 'Deposit not returned'],
  ['DEPOSIT_NOT_RETURNED_NO_DAMAGE_DISPUTE', 'Deposit not returned despite no damage'],
  ['WITHHELD_FOR_DAMAGE', 'Withheld for damage'],
  ['WITHHELD_FOR_UNPAID_RENT', 'Withheld for unpaid rent'],
  ['SEEKING_MONEY_JUDGMENT', 'Seeking money judgment']
];

const BOROUGH_OPTIONS = [
  ['MANHATTAN', 'Manhattan'],
  ['BROOKLYN', 'Brooklyn'],
  ['QUEENS', 'Queens'],
  ['BRONX', 'Bronx'],
  ['STATEN_ISLAND', 'Staten Island']
];

const MAINTENANCE_OPTIONS = [
  ['NO_HEAT', 'No heat'],
  ['NO_HOT_WATER', 'No hot water'],
  ['LEAKS', 'Leaks or water damage'],
  ['MOLD', 'Mold or mildew'],
  ['PESTS', 'Pests'],
  ['BROKEN_APPLIANCES', 'Broken appliances or fixtures'],
  ['UNSAFE_CONDITIONS', 'Unsafe conditions'],
  ['OTHER', 'Other repairs needed']
];

export const FIELD_DEFINITIONS = {
  renterFullName: {
    label: 'Renter full name',
    inputType: 'text',
    placeholder: 'Jane Tenant'
  },
  renterEmail: {
    label: 'Renter email',
    inputType: 'email',
    placeholder: 'jane@example.com'
  },
  renterPhone: {
    label: 'Renter phone',
    inputType: 'tel',
    placeholder: '555-123-4567'
  },
  landlordFullName: {
    label: 'Landlord or management company',
    inputType: 'text',
    placeholder: 'ABC Management'
  },
  landlordEmail: {
    label: 'Landlord email',
    inputType: 'email',
    placeholder: 'landlord@example.com'
  },
  landlordPhone: {
    label: 'Landlord phone',
    inputType: 'tel',
    placeholder: '555-987-6543'
  },
  propertyAddress: {
    label: 'Property address',
    inputType: 'text',
    placeholder: '123 Main Street, Queens, NY 11367'
  },
  city: {
    label: 'City',
    inputType: 'text',
    placeholder: 'Queens'
  },
  state: {
    label: 'State',
    inputType: 'text',
    placeholder: 'NY'
  },
  zipCode: {
    label: 'ZIP code',
    inputType: 'text',
    placeholder: '11367'
  },
  securityDepositAmount: {
    label: 'Security deposit amount',
    inputType: 'number',
    placeholder: '1500'
  },
  amountRequested: {
    label: 'Amount requested',
    inputType: 'number',
    placeholder: '1200'
  },
  leaseStartDate: {
    label: 'Lease start date',
    inputType: 'date'
  },
  leaseEndDate: {
    label: 'Lease end date',
    inputType: 'date'
  },
  moveOutDate: {
    label: 'Move-out date',
    inputType: 'date'
  },
  disputeDescription: {
    label: 'Dispute description',
    inputType: 'textarea',
    placeholder: 'Describe the dispute in plain language.'
  },
  evidenceDescription: {
    label: 'Evidence description',
    inputType: 'textarea',
    placeholder: 'Summarize photos, messages, receipts, or notes you have.'
  },
  currentAddress: {
    label: 'Current mailing address',
    inputType: 'text',
    placeholder: '55 Tenant Avenue'
  },
  claimantAddress: {
    label: 'Claimant mailing address',
    inputType: 'text',
    placeholder: '55 Tenant Avenue'
  },
  claimantCity: {
    label: 'Claimant city',
    inputType: 'text',
    placeholder: 'Queens'
  },
  claimantState: {
    label: 'Claimant state',
    inputType: 'text',
    placeholder: 'NY'
  },
  claimantZipCode: {
    label: 'Claimant ZIP code',
    inputType: 'text',
    placeholder: '11367'
  },
  landlordAddress: {
    label: 'Landlord mailing address',
    inputType: 'text',
    placeholder: '123 Landlord Office Address'
  },
  securityDepositIssueType: {
    label: 'Security deposit issue type',
    inputType: 'select',
    options: SECURITY_DEPOSIT_OPTIONS
  },
  moveInDate: {
    label: 'Move-in date',
    inputType: 'date'
  },
  dateComplainedToLandlord: {
    label: 'Date complained to landlord',
    inputType: 'date'
  },
  attemptedResolution: {
    label: 'Attempted resolution before filing',
    inputType: 'boolean'
  },
  defendantBusinessName: {
    label: 'Defendant business or landlord name',
    inputType: 'text',
    placeholder: 'ABC Management'
  },
  defendantAddress: {
    label: 'Defendant street address',
    inputType: 'text',
    placeholder: '123 Landlord Office Address'
  },
  defendantCity: {
    label: 'Defendant city',
    inputType: 'text',
    placeholder: 'Queens'
  },
  defendantState: {
    label: 'Defendant state',
    inputType: 'text',
    placeholder: 'NY'
  },
  defendantZipCode: {
    label: 'Defendant ZIP code',
    inputType: 'text',
    placeholder: '11367'
  },
  borough: {
    label: 'NYC borough',
    inputType: 'select',
    options: BOROUGH_OPTIONS
  },
  county: {
    label: 'County',
    inputType: 'text',
    placeholder: 'Queens'
  },
  dateOfOccurrence: {
    label: 'Date of occurrence',
    inputType: 'date'
  },
  reasonForClaim: {
    label: 'Reason for claim',
    inputType: 'textarea',
    placeholder: 'Briefly state why you want the deposit returned.'
  },
  respondentName: {
    label: 'Respondent name',
    inputType: 'text',
    placeholder: 'Owner or managing agent'
  },
  respondentAddress: {
    label: 'Respondent address',
    inputType: 'text',
    placeholder: 'Address for the respondent'
  },
  repairConditions: {
    label: 'Repair conditions',
    inputType: 'textarea',
    placeholder: 'Describe the unsafe conditions or repairs you need.'
  },
  maintenanceIssueTypes: {
    label: 'Maintenance issue categories',
    inputType: 'checkboxes',
    options: MAINTENANCE_OPTIONS
  },
  roomsAffected: {
    label: 'Rooms affected',
    inputType: 'text',
    placeholder: 'Kitchen, bathroom'
  },
  commonAreaIssues: {
    label: 'Common area issues',
    inputType: 'text',
    placeholder: 'Hallway lighting, front door lock'
  },
  wantsRepairs: {
    label: 'Are you asking the court to order repairs?',
    inputType: 'boolean'
  },
  confirmationTenantLivesAtProperty: {
    label: 'Tenant currently lives at the property',
    inputType: 'boolean'
  },
  confirmationTenantLivedThereThirtyDays: {
    label: 'Tenant has lived there at least 30 consecutive days',
    inputType: 'boolean'
  },
  confirmationTenantHasLeaseOrAgreement: {
    label: 'Tenant has a lease or agreement',
    inputType: 'boolean'
  },
  dateLandlordNotified: {
    label: 'Date the landlord was notified',
    inputType: 'date'
  },
  hpdInspectionRequested: {
    label: 'HPD inspection already requested',
    inputType: 'boolean'
  }
};

export const ROUTE_BLUEPRINTS = {
  NY_OAG_RENT_SECURITY_COMPLAINT: [
    {
      title: 'Renter details',
      description: 'Confirm the renter contact information used on the complaint.',
      fields: [
        'renterFullName',
        'renterEmail',
        'renterPhone',
        'currentAddress',
        'claimantCity',
        'claimantState',
        'claimantZipCode'
      ]
    },
    {
      title: 'Landlord and property',
      description: 'Add the property and landlord mailing details required by the filing.',
      fields: [
        'landlordFullName',
        'landlordEmail',
        'landlordAddress',
        'propertyAddress',
        'city',
        'state',
        'zipCode'
      ]
    },
    {
      title: 'Deposit complaint facts',
      description: 'These answers drive the route selection and the completed complaint form.',
      fields: [
        'securityDepositIssueType',
        'securityDepositAmount',
        'moveInDate',
        'leaseStartDate',
        'dateComplainedToLandlord',
        'attemptedResolution',
        'disputeDescription',
        'evidenceDescription'
      ]
    }
  ],
  NYC_SMALL_CLAIMS_SECURITY_DEPOSIT_CIV_SC_50: [
    {
      title: 'Claimant details',
      description: 'Use your current mailing address and contact details for the statement of claim.',
      fields: [
        'renterFullName',
        'renterEmail',
        'claimantAddress',
        'claimantCity',
        'claimantState',
        'claimantZipCode'
      ]
    },
    {
      title: 'Defendant details',
      description: 'These fields identify the landlord or business you are filing against.',
      fields: [
        'defendantBusinessName',
        'defendantAddress',
        'defendantCity',
        'defendantState',
        'defendantZipCode',
        'borough'
      ]
    },
    {
      title: 'Claim summary',
      description: 'Keep the short reason concise and focused on the requested money judgment.',
      fields: [
        'amountRequested',
        'securityDepositIssueType',
        'dateOfOccurrence',
        'reasonForClaim',
        'disputeDescription',
        'evidenceDescription'
      ]
    }
  ],
  NYC_HP_ACTION_REPAIRS_PACKET: [
    {
      title: 'Tenant and property details',
      description: 'Confirm the property details and tenancy dates used in the petition.',
      fields: [
        'renterFullName',
        'propertyAddress',
        'city',
        'state',
        'borough',
        'moveInDate',
        'leaseStartDate'
      ]
    },
    {
      title: 'Respondent details',
      description: 'Identify the owner, landlord, or respondent who should receive the petition.',
      fields: [
        'respondentName',
        'respondentAddress',
        'landlordPhone'
      ]
    },
    {
      title: 'Repair conditions',
      description: 'Document the conditions you want corrected and confirm the petition prerequisites.',
      fields: [
        'repairConditions',
        'maintenanceIssueTypes',
        'roomsAffected',
        'commonAreaIssues',
        'wantsRepairs',
        'dateLandlordNotified',
        'hpdInspectionRequested',
        'confirmationTenantLivesAtProperty',
        'confirmationTenantLivedThereThirtyDays',
        'confirmationTenantHasLeaseOrAgreement',
        'evidenceDescription'
      ]
    }
  ]
};

export function getBlueprintForPath(path) {
  return ROUTE_BLUEPRINTS[path] || [];
}

export function coerceFieldValue(fieldName, value) {
  const definition = FIELD_DEFINITIONS[fieldName];

  if (!definition) {
    return value ?? '';
  }

  if (definition.inputType === 'checkboxes') {
    if (Array.isArray(value)) {
      return value;
    }

    if (value === null || value === undefined || value === '') {
      return [];
    }

    return [value];
  }

  if (definition.inputType === 'boolean') {
    return typeof value === 'boolean' ? value : null;
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value ?? '';
}
