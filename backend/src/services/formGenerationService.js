const caseService = require('./caseService');
const evidenceService = require('./evidenceService');
const filingPathRouterService = require('./filingPathRouterService');
const formAnswerService = require('./formAnswerService');
const formRequirementService = require('./formRequirementService');
const generatedFormService = require('./generatedFormService');
const pdfGenerationService = require('./pdfGenerationService');
const { buildFormContext } = require('../utils/formData');
const { validateGenerateFormInput } = require('../utils/validation');

const DISCLAIMER =
  'This generated PDF is for filing assistance only. It is not legal advice and is not an official court or government submission.';

function buildGeneratedFormData(context, route) {
  return {
    selectedFilingPath: route.filingPath,
    selectedFormType: route.formType,
    selectedFormName: route.formName,
    filingDestination: route.filingDestination,
    reasonSelected: route.reasonSelected,
    renter: {
      fullName: context.renterFullName,
      email: context.renterEmail,
      phone: context.renterPhone,
      address: context.currentAddress || context.claimantAddress,
      city: context.claimantCity || context.city,
      state: context.claimantState || context.state,
      zipCode: context.claimantZipCode || context.zipCode
    },
    landlordOrDefendant: {
      fullName: context.landlordFullName,
      businessName: context.defendantBusinessName,
      address: context.respondentAddress || context.defendantAddress || context.landlordAddress || context.propertyAddress,
      city: context.defendantCity,
      state: context.defendantState,
      zipCode: context.defendantZipCode,
      email: context.landlordEmail,
      phone: context.landlordPhone
    },
    property: {
      address: context.propertyAddress,
      city: context.city,
      state: context.state,
      zipCode: context.zipCode,
      borough: context.borough,
      county: context.county
    },
    dispute: {
      disputeType: context.disputeType,
      securityDepositIssueType: context.securityDepositIssueType,
      amountRequested: context.amountRequested,
      securityDepositAmount: context.securityDepositAmount,
      leaseStartDate: context.leaseStartDate,
      leaseEndDate: context.leaseEndDate,
      moveOutDate: context.moveOutDate,
      moveInDate: context.moveInDate,
      dateOfOccurrence: context.dateOfOccurrence,
      dateDemandedReturn: context.dateDemandedReturn,
      dateComplainedToLandlord: context.dateComplainedToLandlord,
      attemptedResolution: context.attemptedResolution,
      reasonForClaim: context.reasonForClaim,
      disputeDescription: context.disputeDescription,
      repairConditions: context.repairConditionsSummary,
      maintenanceIssueTypes: context.maintenanceIssueTypes
    },
    evidenceFiles: context.evidenceFiles,
    evidenceSummary: context.evidenceSummary,
    savedAnswers: context.savedAnswers
  };
}

async function generateFormForCase(user, caseId, payload) {
  validateGenerateFormInput(payload);

  const requirements = await formRequirementService.getFormRequirements(user, caseId);

  if (requirements.status === 'UNSUPPORTED_FORM_TYPE') {
    await caseService.updateCaseStatus(caseId, 'UNSUPPORTED_FORM_TYPE');
    await generatedFormService.upsertGeneratedForm(caseId, {
      selectedFilingPath: requirements.selectedFilingPath,
      selectedFormType: requirements.selectedFormType,
      selectedFormName: '',
      filingDestination: null,
      reasonSelected: null,
      missingFields: [],
      generatedFormData: null,
      generatedPdfFilename: null,
      generatedPdfPath: null,
      generatedPdfUrl: null,
      officialSourceName: null,
      officialSourceUrl: null,
      filingInstructions: []
    });

    return {
      caseId: Number(caseId),
      status: 'UNSUPPORTED_FORM_TYPE',
      selectedFilingPath: requirements.selectedFilingPath,
      selectedFormType: requirements.selectedFormType,
      selectedFormName: null,
      missingFields: [],
      message:
        'No supported official filing path is available for this dispute type or jurisdiction in the MVP.'
    };
  }

  if (requirements.missingFields.length > 0) {
    await caseService.updateCaseStatus(caseId, 'MISSING_FORM_INFORMATION');
    await generatedFormService.upsertGeneratedForm(caseId, {
      selectedFilingPath: requirements.selectedFilingPath,
      selectedFormType: requirements.selectedFormType,
      selectedFormName: requirements.selectedFormName,
      filingDestination: requirements.filingDestination,
      reasonSelected: requirements.reasonSelected,
      missingFields: requirements.missingFields,
      generatedFormData: null,
      generatedPdfFilename: null,
      generatedPdfPath: null,
      generatedPdfUrl: null,
      officialSourceName: requirements.officialSourceName,
      officialSourceUrl: requirements.officialSourceUrl,
      filingInstructions: requirements.filingInstructions
    });

    return {
      caseId: Number(caseId),
      status: 'MISSING_FORM_INFORMATION',
      selectedFilingPath: requirements.selectedFilingPath,
      selectedFormType: requirements.selectedFormType,
      selectedFormName: requirements.selectedFormName,
      missingFields: requirements.missingFields,
      message:
        'Additional information is required before this official form can be generated.'
    };
  }

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
  const route = filingPathRouterService.determineFilingPath(context);

  const generatedFormData = buildGeneratedFormData(context, route);
  const pdfResult = await pdfGenerationService.generatePdf(route, context);

  const generatedFormId = await generatedFormService.upsertGeneratedForm(caseId, {
    selectedFilingPath: route.filingPath,
    selectedFormType: route.formType,
    selectedFormName: route.formName,
    filingDestination: route.filingDestination,
    reasonSelected: route.reasonSelected,
    missingFields: [],
    generatedFormData,
    generatedPdfFilename: pdfResult.generatedPdfFilename,
    generatedPdfPath: pdfResult.generatedPdfPath,
    generatedPdfUrl: null,
    officialSourceName: route.officialSourceName,
    officialSourceUrl: route.officialSourceUrl,
    filingInstructions: route.filingInstructions
  });

  const generatedPdfUrl = generatedFormService.buildGeneratedPdfUrl(generatedFormId);
  await generatedFormService.setGeneratedPdfUrl(generatedFormId, generatedPdfUrl);
  await caseService.updateCaseStatus(caseId, 'FORM_READY');

  const generatedForm = await generatedFormService.getGeneratedFormByCaseId(caseId);

  return {
    caseId: Number(caseId),
    status: 'FORM_READY',
    selectedFilingPath: route.filingPath,
    selectedFormType: route.formType,
    selectedFormName: route.formName,
    filingDestination: route.filingDestination,
    reasonSelected: route.reasonSelected,
    missingFields: [],
    generatedForm: {
      id: generatedForm.id,
      generatedPdfUrl: generatedForm.generatedPdfUrl,
      generatedPdfFilename: generatedForm.generatedPdfFilename,
      createdAt: generatedForm.createdAt
    },
    generatedFormData,
    filingInstructions: route.filingInstructions,
    disclaimer: DISCLAIMER
  };
}

module.exports = {
  DISCLAIMER,
  generateFormForCase
};
