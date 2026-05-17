const caseService = require('./caseService');
const evidenceService = require('./evidenceService');
const filingPathRouterService = require('./filingPathRouterService');
const formAnswerService = require('./formAnswerService');
const { buildFormContext, firstNonEmpty } = require('../utils/formData');

function buildMissingField(field, label, question) {
  return {
    field,
    label,
    question
  };
}

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && String(value).trim() !== '';
}

function getMissingFieldsForPath(route, context) {
  const missingFields = [];

  if (route.filingPath === 'UNSUPPORTED_FORM_TYPE') {
    return missingFields;
  }

  if (route.filingPath === 'NY_OAG_RENT_SECURITY_COMPLAINT') {
    if (!hasValue(context.renterFullName)) {
      missingFields.push(buildMissingField('renterFullName', 'Renter full name', 'What is your full legal name?'));
    }
    if (!hasValue(context.renterEmail)) {
      missingFields.push(buildMissingField('renterEmail', 'Renter email', 'What email address should be used for this filing?'));
    }
    if (!hasValue(context.renterPhone) && !hasValue(context.currentAddress)) {
      missingFields.push(buildMissingField('renterPhone', 'Renter phone or current address', 'Provide either your phone number or your current mailing address.'));
    }
    if (!hasValue(context.landlordFullName)) {
      missingFields.push(buildMissingField('landlordFullName', 'Landlord name', 'What is the landlord or management company name?'));
    }
    if (!hasValue(context.landlordEmail) && !hasValue(context.landlordAddress)) {
      missingFields.push(buildMissingField('landlordAddress', 'Landlord mailing address', 'What mailing address should be used for the landlord or management company?'));
    }
    if (!hasValue(context.propertyAddress)) {
      missingFields.push(buildMissingField('propertyAddress', 'Property address', 'What is the apartment or property address involved in the complaint?'));
    }
    if (String(context.state || '').toUpperCase() !== 'NY') {
      missingFields.push(buildMissingField('state', 'State', 'This filing path requires a New York property. Confirm the state as NY.'));
    }
    if (!hasValue(context.securityDepositIssueType)) {
      missingFields.push(buildMissingField('securityDepositIssueType', 'Security deposit issue type', 'Which security deposit issue best matches your situation?'));
    }
    if (!hasValue(context.securityDepositAmount)) {
      missingFields.push(buildMissingField('securityDepositAmount', 'Security deposit amount', 'What was the total security deposit amount?'));
    }
    if (!hasValue(context.leaseStartDate) && !hasValue(context.moveInDate)) {
      missingFields.push(buildMissingField('moveInDate', 'Move-in date or lease start date', 'When did you move in or when did the lease start?'));
    }
    if (!hasValue(context.dateComplainedToLandlord)) {
      missingFields.push(buildMissingField('dateComplainedToLandlord', 'Date complained to landlord', 'When did you complain to the landlord or management company?'));
    }
    if (context.attemptedResolution === null || context.attemptedResolution === undefined) {
      missingFields.push(buildMissingField('attemptedResolution', 'Attempted resolution', 'Did you try to resolve the problem with the landlord before filing?'));
    }
    if (!hasValue(context.disputeDescription)) {
      missingFields.push(buildMissingField('disputeDescription', 'Dispute description', 'Describe what happened with the security deposit.'));
    }
  }

  if (route.filingPath === 'NYC_SMALL_CLAIMS_SECURITY_DEPOSIT_CIV_SC_50') {
    if (!hasValue(context.renterFullName)) {
      missingFields.push(buildMissingField('renterFullName', 'Claimant name', 'What is your full legal name?'));
    }
    if (!hasValue(context.renterEmail)) {
      missingFields.push(buildMissingField('renterEmail', 'Claimant email', 'What email address should be used for this filing?'));
    }
    if (!hasValue(context.claimantAddress) && !hasValue(context.currentAddress)) {
      missingFields.push(buildMissingField('claimantAddress', 'Claimant address', 'What is your current mailing address?'));
    }
    if (!hasValue(context.landlordFullName) && !hasValue(context.defendantBusinessName)) {
      missingFields.push(buildMissingField('defendantBusinessName', 'Landlord or defendant name', 'What is the landlord, owner, or business name you are filing against?'));
    }
    if (!hasValue(context.defendantAddress)) {
      missingFields.push(buildMissingField('defendantAddress', 'Landlord or management company address', 'What is the street address of the landlord, owner, or management company you are filing against?'));
    }
    if (!hasValue(context.defendantCity)) {
      missingFields.push(buildMissingField('defendantCity', 'Defendant city', 'What city should be used for the landlord or defendant address?'));
    }
    if (!hasValue(context.defendantState)) {
      missingFields.push(buildMissingField('defendantState', 'Defendant state', 'What state should be used for the landlord or defendant address?'));
    }
    if (!hasValue(context.defendantZipCode)) {
      missingFields.push(buildMissingField('defendantZipCode', 'Defendant ZIP code', 'What ZIP code should be used for the landlord or defendant address?'));
    }
    if (!hasValue(context.borough) && !hasValue(context.county)) {
      missingFields.push(buildMissingField('borough', 'Borough or county', 'Which New York City borough or county should this small claims filing use?'));
    }
    if (!hasValue(context.amountRequested)) {
      missingFields.push(buildMissingField('amountRequested', 'Amount requested', 'How much money are you asking the court to award?'));
    } else if (Number(context.amountRequested) > 10000) {
      missingFields.push(buildMissingField('amountRequested', 'Amount requested', 'This MVP small claims path only supports claims of $10,000 or less.'));
    }
    if (!hasValue(context.dateOfOccurrence) && !hasValue(context.moveOutDate)) {
      missingFields.push(buildMissingField('dateOfOccurrence', 'Date of occurrence or move-out date', 'When did the event happen or when did you move out?'));
    }
    if (!hasValue(context.reasonForClaim)) {
      missingFields.push(buildMissingField('reasonForClaim', 'Reason for claim', 'Briefly state why you are seeking return of the deposit.'));
    }
    if (!hasValue(context.disputeDescription)) {
      missingFields.push(buildMissingField('disputeDescription', 'Dispute description', 'Describe what happened with the security deposit.')); 
    }
  }

  if (route.filingPath === 'NYC_HP_ACTION_REPAIRS_PACKET') {
    if (!hasValue(context.renterFullName)) {
      missingFields.push(buildMissingField('renterFullName', 'Tenant name', 'What is your full legal name?'));
    }
    if (!hasValue(context.propertyAddress)) {
      missingFields.push(buildMissingField('propertyAddress', 'Property address', 'What is the apartment or property address that needs repairs?'));
    }
    if (String(context.state || '').toUpperCase() !== 'NY') {
      missingFields.push(buildMissingField('state', 'State', 'This filing path requires a New York property. Confirm the state as NY.'));
    }
    if (!hasValue(context.borough) && !hasValue(context.county) && !hasValue(context.city)) {
      missingFields.push(buildMissingField('borough', 'NYC borough or county', 'Which New York City borough or county is the property located in?'));
    }
    if (!hasValue(context.moveInDate) && !hasValue(context.leaseStartDate)) {
      missingFields.push(buildMissingField('moveInDate', 'Move-in date or lease start date', 'When did you move into the apartment or when did the lease start?'));
    }
    if (!hasValue(context.landlordFullName) && !hasValue(context.respondentName)) {
      missingFields.push(buildMissingField('respondentName', 'Landlord or respondent name', 'Who is the owner, landlord, or respondent for this repairs case?'));
    }
    if (!hasValue(context.respondentAddress) && !hasValue(context.landlordAddress)) {
      missingFields.push(buildMissingField('respondentAddress', 'Respondent address', 'What address should be used for the landlord or respondent?'));
    }
    if (
      !hasValue(context.repairConditions) &&
      !hasValue(context.disputeDescription) &&
      (!Array.isArray(context.maintenanceIssueTypes) || context.maintenanceIssueTypes.length === 0)
    ) {
      missingFields.push(buildMissingField('repairConditions', 'Repair conditions', 'Describe the repairs, unsafe conditions, or service problems you want corrected.'));
    }
    if (context.confirmationTenantLivesAtProperty !== true) {
      missingFields.push(buildMissingField('confirmationTenantLivesAtProperty', 'Tenant currently lives at the property', 'Please confirm that you currently live at the property.'));
    }
    if (context.confirmationTenantLivedThereThirtyDays !== true) {
      missingFields.push(buildMissingField('confirmationTenantLivedThereThirtyDays', 'Tenant lived there at least 30 days', 'Please confirm that you have lived at the property for at least 30 consecutive days.'));
    }
    if (context.confirmationTenantHasLeaseOrAgreement !== true) {
      missingFields.push(buildMissingField('confirmationTenantHasLeaseOrAgreement', 'Tenant has lease or agreement', 'Please confirm that you have a lease or an agreement to live at the property.'));
    }
  }

  return missingFields;
}

function buildUnsupportedResponse(caseId) {
  return {
    caseId,
    status: 'UNSUPPORTED_FORM_TYPE',
    selectedFilingPath: 'UNSUPPORTED_FORM_TYPE',
    selectedFormType: 'UNSUPPORTED_FORM_TYPE',
    selectedFormName: null,
    filingDestination: null,
    reasonSelected: null,
    missingFields: [],
    requiredQuestions: [],
    currentAnswers: {},
    canGenerate: false,
    officialSourceName: null,
    officialSourceUrl: null,
    filingInstructions: [],
    message:
      'No supported official filing path is available for this dispute type or jurisdiction in the MVP.'
  };
}

async function getFormRequirements(user, caseId) {
  const caseRecord = await caseService.getCaseByIdForUser(user, caseId);
  const savedAnswers = await formAnswerService.getFormAnswersByCaseId(caseRecord.caseId);
  const evidenceFiles = (await evidenceService.getEvidenceReferencesForCase(caseRecord.caseId)).map(
    (file) => ({
      evidenceId: file.evidenceId,
      originalFilename: file.originalFilename,
      mimeType: file.mimeType,
      fileSizeBytes: file.fileSizeBytes,
      createdAt: file.createdAt,
      fileUrl: `/api/evidence/${file.evidenceId}/file`
    })
  );

  const context = buildFormContext(caseRecord, savedAnswers, evidenceFiles);
  const selectedRoute = filingPathRouterService.determineFilingPath(context);

  if (selectedRoute.filingPath === 'UNSUPPORTED_FORM_TYPE') {
    return {
      ...buildUnsupportedResponse(caseRecord.caseId),
      currentAnswers: savedAnswers
    };
  }

  const missingFields = getMissingFieldsForPath(selectedRoute, context);

  return {
    caseId: caseRecord.caseId,
    status: missingFields.length > 0 ? 'MISSING_FORM_INFORMATION' : 'READY_FOR_GENERATION',
    selectedFilingPath: selectedRoute.filingPath,
    selectedFormType: selectedRoute.formType,
    selectedFormName: selectedRoute.formName,
    filingDestination: selectedRoute.filingDestination,
    reasonSelected: selectedRoute.reasonSelected,
    missingFields,
    requiredQuestions: missingFields,
    currentAnswers: savedAnswers,
    canGenerate: missingFields.length === 0,
    officialSourceName: selectedRoute.officialSourceName,
    officialSourceUrl: selectedRoute.officialSourceUrl,
    filingInstructions: selectedRoute.filingInstructions,
    generatedFormDataPreview: {
      disputeType: context.disputeType,
      amountRequested: context.amountRequested,
      evidenceFiles,
      securityDepositIssueType: context.securityDepositIssueType,
      maintenanceIssueTypes: firstNonEmpty(context.maintenanceIssueTypes, [])
    },
    message:
      missingFields.length > 0
        ? 'Additional information is required before this official form can be generated.'
        : 'All currently required information is available for PDF generation.'
  };
}

module.exports = {
  buildUnsupportedResponse,
  getFormRequirements,
  getMissingFieldsForPath
};
