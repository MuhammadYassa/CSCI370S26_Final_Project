function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        return value;
      }
      continue;
    }

    return value;
  }

  return null;
}

function formatDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const stringValue = String(value).trim();
  if (!stringValue) {
    return null;
  }

  return stringValue.slice(0, 10);
}

function formatDateUs(value) {
  const normalized = formatDate(value);
  if (!normalized) {
    return null;
  }

  const [year, month, day] = normalized.split('-');
  return `${month}/${day}/${year}`;
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return `$${numericValue.toFixed(2)}`;
}

function buildCityStateZipLine(city, state, zipCode) {
  const parts = [];
  if (city) {
    parts.push(city);
  }
  if (state) {
    parts.push(state);
  }

  const line = parts.join(', ');
  if (zipCode) {
    return line ? `${line} ${zipCode}` : zipCode;
  }

  return line || null;
}

function normalizeTextForSearch(value) {
  return String(value || '').toLowerCase();
}

function splitPersonName(fullName) {
  const trimmed = String(fullName || '').trim();
  if (!trimmed) {
    return {
      firstName: null,
      middleInitial: null,
      lastName: null
    };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return {
      firstName: null,
      middleInitial: null,
      lastName: parts[0]
    };
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleInitial =
    parts.length > 2 && parts[1] ? parts[1].charAt(0).toUpperCase() : null;

  return {
    firstName,
    middleInitial,
    lastName
  };
}

function normalizeChoice(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_');
}

function parseBooleanish(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = normalizeChoice(value);
  if (!normalized) {
    return null;
  }

  if (['TRUE', 'YES', 'Y', '1'].includes(normalized)) {
    return true;
  }

  if (['FALSE', 'NO', 'N', '0'].includes(normalized)) {
    return false;
  }

  return null;
}

function parseAddressComponents(address) {
  const value = String(address || '').trim();
  if (!value) {
    return {
      original: null,
      street: null,
      city: null,
      state: null,
      zipCode: null,
      apartment: null
    };
  }

  const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
  const streetPart = parts[0] || value;
  const cityPart = parts[1] || null;
  const stateZipPart = parts[2] || '';
  const stateZipMatch = stateZipPart.match(/^([A-Za-z]{2})(?:\s+(\d{5}(?:-\d{4})?))?$/);
  const apartmentMatch = streetPart.match(/\b(?:APT|APARTMENT|UNIT|#)\s*([A-Z0-9-]+)\b/i);

  return {
    original: value,
    street: streetPart,
    city: cityPart,
    state: stateZipMatch ? stateZipMatch[1].toUpperCase() : null,
    zipCode: stateZipMatch ? stateZipMatch[2] || null : null,
    apartment: apartmentMatch ? apartmentMatch[1] : null
  };
}

function deriveCountyName(borough, county, city) {
  const normalizedCounty = String(county || '').trim();
  if (normalizedCounty) {
    return normalizedCounty.replace(/\s+County$/i, '');
  }

  const normalizedBorough = normalizeChoice(borough || city);
  const boroughMap = {
    BROOKLYN: 'Kings',
    MANHATTAN: 'New York',
    QUEENS: 'Queens',
    BRONX: 'Bronx',
    STATEN_ISLAND: 'Richmond'
  };

  return boroughMap[normalizedBorough] || null;
}

function looksLikeBusinessName(value) {
  return includesAnyKeyword(value, [
    'llc',
    'inc',
    'corp',
    'corporation',
    'company',
    'co.',
    'management',
    'properties',
    'holdings'
  ]);
}

function hasChoiceValue(value, expectedValues) {
  const normalizedExpected = expectedValues.map((entry) => normalizeChoice(entry));
  return toArray(value).some((entry) => {
    const normalizedEntry = normalizeChoice(entry);
    return normalizedExpected.some(
      (expected) =>
        normalizedEntry === expected ||
        normalizedEntry.includes(expected) ||
        expected.includes(normalizedEntry)
    );
  });
}

function includesAnyKeyword(value, keywords) {
  const haystack = normalizeTextForSearch(value);
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return [value];
}

function buildFormContext(caseRecord, savedAnswers, evidenceFiles) {
  const answers = savedAnswers || {};
  const city = firstNonEmpty(caseRecord.city, answers.city);
  const state = firstNonEmpty(caseRecord.state, answers.state);
  const zipCode = firstNonEmpty(caseRecord.zipCode, answers.zipCode);
  const claimantAddress = firstNonEmpty(answers.claimantAddress, answers.currentAddress);
  const defendantAddress = firstNonEmpty(answers.defendantAddress, answers.landlordAddress);
  const monthlyRent = firstNonEmpty(answers.monthlyRent, answers.mostRecentMonthlyRent);
  const respondentRole = firstNonEmpty(answers.respondentRole, answers.respondentRoles);
  const contactMethod = firstNonEmpty(answers.contactMethod, answers.contactMethods);
  const countyName = deriveCountyName(answers.borough, answers.county, city);

  const context = {
    caseId: caseRecord.caseId,
    status: caseRecord.status,
    renterFullName: caseRecord.renterFullName,
    renterEmail: caseRecord.renterEmail,
    renterPhone: firstNonEmpty(caseRecord.renterPhone, answers.renterPhone),
    landlordFullName: firstNonEmpty(caseRecord.landlordFullName, answers.landlordFullName),
    landlordEmail: firstNonEmpty(caseRecord.landlordEmail, answers.landlordEmail),
    landlordPhone: firstNonEmpty(caseRecord.landlordPhone, answers.landlordPhone),
    propertyAddress: firstNonEmpty(caseRecord.propertyAddress, answers.propertyAddress),
    city,
    state,
    zipCode,
    disputeType: firstNonEmpty(caseRecord.disputeType, answers.disputeType),
    securityDepositAmount: firstNonEmpty(
      caseRecord.securityDepositAmount,
      answers.securityDepositAmount
    ),
    amountRequested: firstNonEmpty(caseRecord.amountRequested, answers.amountRequested),
    leaseStartDate: formatDate(firstNonEmpty(caseRecord.leaseStartDate, answers.leaseStartDate)),
    leaseEndDate: formatDate(firstNonEmpty(caseRecord.leaseEndDate, answers.leaseEndDate)),
    moveOutDate: formatDate(firstNonEmpty(caseRecord.moveOutDate, answers.moveOutDate)),
    disputeDescription: firstNonEmpty(caseRecord.disputeDescription, answers.disputeDescription),
    evidenceDescription: firstNonEmpty(caseRecord.evidenceDescription, answers.evidenceDescription),
    generatedDate: new Date().toISOString().slice(0, 10),
    claimantAddress,
    currentAddress: firstNonEmpty(answers.currentAddress, claimantAddress),
    claimantCity: firstNonEmpty(answers.claimantCity, city),
    claimantState: firstNonEmpty(answers.claimantState, state),
    claimantZipCode: firstNonEmpty(answers.claimantZipCode, zipCode),
    claimantCityStateZipLine: buildCityStateZipLine(
      firstNonEmpty(answers.claimantCity, city),
      firstNonEmpty(answers.claimantState, state),
      firstNonEmpty(answers.claimantZipCode, zipCode)
    ),
    cityStateZipLine: buildCityStateZipLine(city, state, zipCode),
    securityDepositIssueType: firstNonEmpty(answers.securityDepositIssueType),
    borough: firstNonEmpty(answers.borough),
    county: firstNonEmpty(answers.county),
    defendantBusinessName: firstNonEmpty(answers.defendantBusinessName),
    defendantAddress,
    landlordAddress: firstNonEmpty(answers.landlordAddress, defendantAddress),
    defendantCity: firstNonEmpty(answers.defendantCity, city),
    defendantState: firstNonEmpty(answers.defendantState, state),
    defendantZipCode: firstNonEmpty(answers.defendantZipCode, zipCode),
    defendantCityStateZipLine: buildCityStateZipLine(
      firstNonEmpty(answers.defendantCity, city),
      firstNonEmpty(answers.defendantState, state),
      firstNonEmpty(answers.defendantZipCode, zipCode)
    ),
    dateDemandedReturn: formatDate(answers.dateDemandedReturn),
    attemptedResolution: answers.attemptedResolution,
    dateComplainedToLandlord: formatDate(answers.dateComplainedToLandlord),
    dateOfOccurrence: formatDate(answers.dateOfOccurrence),
    reasonForClaim: firstNonEmpty(answers.reasonForClaim),
    wantsRepairs: answers.wantsRepairs,
    maintenanceIssueTypes: toArray(answers.maintenanceIssueTypes),
    moveInDate: formatDate(answers.moveInDate),
    respondentName: firstNonEmpty(answers.respondentName, caseRecord.landlordFullName),
    respondentAddress: firstNonEmpty(answers.respondentAddress, answers.landlordAddress, defendantAddress),
    repairConditions: firstNonEmpty(answers.repairConditions),
    repairConditionsSummary: firstNonEmpty(
      answers.repairConditions,
      toArray(answers.maintenanceIssueTypes).join(', '),
      caseRecord.disputeDescription
    ),
    confirmationTenantLivesAtProperty: answers.confirmationTenantLivesAtProperty,
    confirmationTenantLivedThereThirtyDays: answers.confirmationTenantLivedThereThirtyDays,
    confirmationTenantHasLeaseOrAgreement: answers.confirmationTenantHasLeaseOrAgreement,
    propertyType: firstNonEmpty(answers.propertyType),
    relatedCaseExists: answers.relatedCaseExists,
    relatedCaseIndexNumber: firstNonEmpty(answers.relatedCaseIndexNumber),
    relatedCaseNextCourtDate: formatDate(answers.relatedCaseNextCourtDate),
    roomsAffected: toArray(answers.roomsAffected),
    commonAreaIssues: toArray(answers.commonAreaIssues),
    heatHotWaterIssue: answers.heatHotWaterIssue,
    emergencyCondition: answers.emergencyCondition,
    dateLandlordNotified: formatDate(answers.dateLandlordNotified),
    hpdInspectionRequested: answers.hpdInspectionRequested,
    personContacted: firstNonEmpty(answers.personContacted, caseRecord.landlordFullName),
    mostRecentMonthlyRent: monthlyRent,
    monthlyRent,
    securityDepositInterestReceived: answers.securityDepositInterestReceived,
    priorCourtProceedings: answers.priorCourtProceedings,
    otherLitigationDescription: firstNonEmpty(answers.otherLitigationDescription),
    formerLandlords: toArray(answers.formerLandlords),
    additionalInformation: firstNonEmpty(answers.additionalInformation),
    managingAgentName: firstNonEmpty(answers.managingAgentName),
    managingAgentAddress: firstNonEmpty(answers.managingAgentAddress),
    managingAgentPhone: firstNonEmpty(answers.managingAgentPhone),
    numberOfApartmentsInBuilding: firstNonEmpty(answers.numberOfApartmentsInBuilding),
    rentControlledOrStabilized: answers.rentControlledOrStabilized,
    securityDepositDatePaid: formatDate(answers.securityDepositDatePaid),
    landlordClaimsDamage: answers.landlordClaimsDamage,
    landlordClaimsUnpaidRent: answers.landlordClaimsUnpaidRent,
    respondentRole,
    contactMethod,
    evidenceFiles: evidenceFiles || [],
    savedAnswers: answers
  };

  context.securityDepositAmountDisplay = formatCurrency(context.securityDepositAmount);
  context.amountRequestedDisplay = formatCurrency(context.amountRequested);
  context.amountRequestedPlain =
    context.amountRequested !== undefined && context.amountRequested !== null && context.amountRequested !== ''
      ? Number(context.amountRequested).toFixed(2)
      : null;
  context.securityDepositAmountWithDate = context.securityDepositAmountDisplay
    ? context.securityDepositDatePaid
      ? `${context.securityDepositAmountDisplay} on ${context.securityDepositDatePaid}`
      : context.securityDepositAmountDisplay
    : null;
  context.evidenceSummary = context.evidenceFiles.length > 0
    ? context.evidenceFiles
      .map((file) => `${file.originalFilename} (${file.mimeType})`)
      .join('; ')
    : firstNonEmpty(caseRecord.evidenceDescription);
  context.reasonForClaimWithDescription = [context.reasonForClaim, context.disputeDescription]
    .filter(Boolean)
    .join(' ');
  context.generatedDateUs = formatDateUs(context.generatedDate);
  context.dateOfOccurrenceUs = formatDateUs(context.dateOfOccurrence);
  context.moveOutDateUs = formatDateUs(context.moveOutDate);
  context.moveInDateUs = formatDateUs(context.moveInDate);
  context.leaseStartDateUs = formatDateUs(context.leaseStartDate);
  context.relatedCaseNextCourtDateUs = formatDateUs(context.relatedCaseNextCourtDate);
  const claimantNameParts = splitPersonName(context.renterFullName);
  context.claimantLastNameOrFullName = claimantNameParts.lastName || context.renterFullName;
  context.claimantFirstName = claimantNameParts.firstName;
  context.claimantMiddleInitial = claimantNameParts.middleInitial;
  context.claimantOtherInfo = context.claimantCityStateZipLine;
  const defendantDisplayName = firstNonEmpty(context.defendantBusinessName, context.landlordFullName);
  const defendantNameParts = context.defendantBusinessName || looksLikeBusinessName(defendantDisplayName)
    ? {
      firstName: null,
      middleInitial: null,
      lastName: context.defendantBusinessName || defendantDisplayName
    }
    : splitPersonName(defendantDisplayName);
  context.defendantDisplayName = defendantNameParts.lastName || defendantDisplayName;
  context.defendantFirstName = defendantNameParts.firstName;
  context.defendantMiddleInitial = defendantNameParts.middleInitial;
  context.defendantOtherInfo = firstNonEmpty(context.landlordEmail, context.landlordPhone);
  context.smallClaimsBriefReason = firstNonEmpty(
    context.reasonForClaim,
    context.disputeDescription
  );
  if (context.smallClaimsBriefReason && context.smallClaimsBriefReason.length > 110) {
    context.smallClaimsBriefReason = `${context.smallClaimsBriefReason.slice(0, 107)}...`;
  }
  context.identifyingNumbers = firstNonEmpty(context.propertyAddress, context.zipCode);
  context.isSecurityDepositClaim = String(context.disputeType || '').toUpperCase() === 'SECURITY_DEPOSIT';
  context.currentAddressComponents = parseAddressComponents(context.currentAddress || context.claimantAddress);
  context.propertyAddressComponents = parseAddressComponents(context.propertyAddress);
  context.landlordAddressComponents = parseAddressComponents(context.landlordAddress || context.defendantAddress);
  context.managingAgentAddressComponents = parseAddressComponents(context.managingAgentAddress);
  context.currentStreetAddress = context.currentAddressComponents.street;
  context.currentApartmentNumber = context.currentAddressComponents.apartment;
  context.landlordStreetAddress = context.landlordAddressComponents.street;
  context.landlordCity = firstNonEmpty(context.landlordAddressComponents.city, context.defendantCity);
  context.landlordState = firstNonEmpty(context.landlordAddressComponents.state, context.defendantState);
  context.landlordZipCode = firstNonEmpty(context.landlordAddressComponents.zipCode, context.defendantZipCode);
  context.managingAgentStreetAddress = context.managingAgentAddressComponents.street;
  context.managingAgentCity = context.managingAgentAddressComponents.city;
  context.managingAgentState = context.managingAgentAddressComponents.state;
  context.managingAgentZipCode = context.managingAgentAddressComponents.zipCode;
  context.countyName = countyName;
  context.countyDisplay = countyName ? `${countyName} County` : null;
  context.courtNameShort = countyName ? 'Housing' : null;
  context.relatedCaseExistsBoolean = parseBooleanish(context.relatedCaseExists);
  context.hasRelatedCase = context.relatedCaseExistsBoolean === true;
  context.hasNoRelatedCase = context.relatedCaseExistsBoolean === false;
  context.monthlyRentPlain =
    context.monthlyRent !== undefined &&
    context.monthlyRent !== null &&
    context.monthlyRent !== '' &&
    Number.isFinite(Number(context.monthlyRent))
      ? Number(context.monthlyRent).toFixed(2)
      : null;
  context.shortRepairConditions = firstNonEmpty(context.repairConditions, context.disputeDescription);
  if (context.shortRepairConditions && context.shortRepairConditions.length > 420) {
    context.shortRepairConditions = `${context.shortRepairConditions.slice(0, 417)}...`;
  }
  context.isPropertyTypeSingleFamily = hasChoiceValue(context.propertyType, [
    'SINGLE_FAMILY',
    'SINGLE FAMILY',
    '1_UNIT'
  ]);
  context.isPropertyTypeMultiFamily = hasChoiceValue(context.propertyType, [
    'MULTI_FAMILY',
    'MULTI FAMILY',
    '2_4_UNITS'
  ]);
  context.isPropertyTypeApartmentBuilding = hasChoiceValue(context.propertyType, [
    'APARTMENT_BUILDING',
    'APARTMENT BUILDING',
    'MORE_THAN_4_UNITS'
  ]);
  context.respondentRoleOwner = hasChoiceValue(context.respondentRole, ['OWNER', 'PART_OWNER', 'LANDLORD']);
  context.respondentRoleAgent = hasChoiceValue(context.respondentRole, ['AGENT', 'PROPERTY_MANAGER', 'MANAGEMENT']);
  context.respondentRoleOther = hasChoiceValue(context.respondentRole, ['OTHER']);
  context.respondentBusinessAddress = looksLikeBusinessName(
    firstNonEmpty(context.respondentName, context.landlordFullName, context.defendantBusinessName)
  );
  context.contactMethodByPhone = hasChoiceValue(contactMethod, ['PHONE', 'BY_PHONE']);
  context.contactMethodLetter = hasChoiceValue(contactMethod, ['LETTER', 'MAIL']);
  context.contactMethodInPerson = hasChoiceValue(contactMethod, ['IN_PERSON', 'IN PERSON']);
  context.contactMethodOther = hasChoiceValue(contactMethod, ['OTHER']);
  context.contactMethodOtherText = context.contactMethodOther
    ? firstNonEmpty(answers.contactMethodOther, answers.otherContactMethod)
    : null;
  const priorCourtProceedingsBoolean = parseBooleanish(
    firstNonEmpty(context.priorCourtProceedings, context.relatedCaseExists)
  );
  context.priorCourtProceedingsYes = priorCourtProceedingsBoolean === true;
  context.priorCourtProceedingsNo = priorCourtProceedingsBoolean === false;
  context.oagConcernDepositNotReturned = hasChoiceValue(context.securityDepositIssueType, [
    'DEPOSIT_NOT_RETURNED_GENERAL',
    'DEPOSIT_NOT_RETURNED_NO_DAMAGE_DISPUTE'
  ]);
  context.oagConcernTrustAccount = hasChoiceValue(context.securityDepositIssueType, [
    'TRUST_ACCOUNT_NOT_DISCLOSED'
  ]);
  context.oagConcernInterest = hasChoiceValue(context.securityDepositIssueType, ['INTEREST_NOT_PAID']);
  const wantsRepairsBoolean = parseBooleanish(context.wantsRepairs);
  context.shouldOrderRepairs = wantsRepairsBoolean === null ? true : wantsRepairsBoolean;

  return context;
}

module.exports = {
  buildFormContext,
  buildCityStateZipLine,
  firstNonEmpty,
  formatCurrency,
  formatDate,
  formatDateUs,
  includesAnyKeyword,
  normalizeTextForSearch,
  splitPersonName,
  toArray
};
