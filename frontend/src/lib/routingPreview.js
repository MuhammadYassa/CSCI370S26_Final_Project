function normalized(value) {
  return String(value || '').trim().toUpperCase();
}

function text(value) {
  return String(value || '').toLowerCase();
}

function isNYCContext(values) {
  const haystack = [
    values.city,
    values.state,
    values.propertyAddress
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return [
    'new york city',
    'nyc',
    'queens',
    'brooklyn',
    'manhattan',
    'bronx',
    'staten island'
  ].some((token) => haystack.includes(token));
}

function inferSecurityDepositIssue(values) {
  const direct = normalized(values.securityDepositIssueType);

  if (direct) {
    return direct;
  }

  const description = text(values.disputeDescription);

  if (
    description.includes('damage') ||
    description.includes('withheld') ||
    description.includes('unpaid rent')
  ) {
    return 'WITHHELD_FOR_DAMAGE';
  }

  if (
    description.includes('interest') ||
    description.includes('trust account')
  ) {
    return 'INTEREST_NOT_PAID';
  }

  return '';
}

export function getRoutePreview(values) {
  const disputeType = normalized(values.disputeType);
  const state = normalized(values.state);
  const issueType = inferSecurityDepositIssue(values);
  const amountRequested = Number(values.amountRequested);
  const isAmountOkay =
    !values.amountRequested || (Number.isFinite(amountRequested) && amountRequested <= 10000);

  if (
    disputeType === 'SECURITY_DEPOSIT' &&
    state === 'NY' &&
    [
      'INTEREST_NOT_PAID',
      'TRUST_ACCOUNT_NOT_DISCLOSED',
      'DEPOSIT_NOT_RETURNED_GENERAL',
      'DEPOSIT_NOT_RETURNED_NO_DAMAGE_DISPUTE'
    ].includes(issueType)
  ) {
    return {
      status: 'supported',
      title: 'Likely filing path: New York Attorney General complaint',
      description:
        'The current facts look like a statewide security-deposit complaint. After you create the case, the form workflow will ask follow-up questions about the deposit, your contact details, and whether you already tried to resolve the issue.',
      followUps: [
        'Security deposit issue type',
        'Move-in date or lease start date',
        'Date you complained to the landlord',
        'Whether you attempted resolution first'
      ]
    };
  }

  if (
    disputeType === 'SECURITY_DEPOSIT' &&
    state === 'NY' &&
    [
      'WITHHELD_FOR_DAMAGE',
      'WITHHELD_FOR_UNPAID_RENT',
      'SEEKING_MONEY_JUDGMENT'
    ].includes(issueType) &&
    isNYCContext(values) &&
    isAmountOkay
  ) {
    return {
      status: 'supported',
      title: 'Likely filing path: NYC small claims',
      description:
        'This looks like a supported New York City small-claims dispute. The next step will gather claimant and defendant mailing details, borough information, and the short reason for the claim.',
      followUps: [
        'Claimant mailing address',
        'Landlord or defendant business address',
        'Borough or county',
        'Reason for claim'
      ]
    };
  }

  if (
    disputeType === 'MAINTENANCE' &&
    state === 'NY' &&
    isNYCContext(values)
  ) {
    return {
      status: 'supported',
      title: 'Likely filing path: NYC repairs petition',
      description:
        'The case appears to fit the Housing Court repairs workflow. The next questions will focus on the conditions that need repair, tenancy confirmations, and the landlord or respondent address.',
      followUps: [
        'Move-in date',
        'Repair conditions or issue categories',
        'Respondent name and address',
        'Tenant confirmations for the petition'
      ]
    };
  }

  return {
    status: 'unsupported',
    title: 'No guaranteed supported path yet',
    description:
      'The backend may return an unsupported-form result for this combination of dispute type and jurisdiction. You can still save the case, keep your facts organized, and print a general dispute summary from the frontend.',
    followUps: [
      'Check that the property is in New York',
      'Use a supported dispute type',
      'Keep the amount at or under $10,000 for the NYC small-claims path'
    ]
  };
}
