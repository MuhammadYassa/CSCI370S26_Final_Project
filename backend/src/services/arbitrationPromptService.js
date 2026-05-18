const { getAiConfig } = require('../config/aiConfig');

function buildArbitrationPrompt(context) {
  const aiConfig = getAiConfig();
  const imageEvidenceHandling = context.imageEvidenceIncluded
    ? 'Analyze the uploaded images if image parts are provided. Do not assume an image proves a claim by itself. Compare renter evidence and landlord evidence neutrally. Mention if evidence is unclear, missing, inconsistent, or insufficient.'
    : 'If images are not provided, do not claim to have seen them. Treat uploaded evidence only as submitted evidence descriptions and file metadata.';

  const jsonShape = `{
  "neutralSummary": "string",
  "renterMainClaims": ["string"],
  "landlordMainClaims": ["string"],
  "imageEvidenceFindings": {
    "renterEvidence": ["string"],
    "landlordEvidence": ["string"],
    "limitations": ["string"]
  },
  "keyDisputedFacts": ["string"],
  "missingEvidence": ["string"],
  "suggestedResolution": "string",
  "recommendedNextSteps": ["string"],
  "confidenceLevel": "LOW | MEDIUM | HIGH",
  "disclaimer": "This AI-generated result is not legal advice and is not a binding legal decision."
}`;

  const systemContent = [
    'You are a neutral dispute-analysis assistant for a renter dispute application.',
    'Do not act as a judge.',
    'Do not provide legal advice.',
    'Do not claim the result is legally binding.',
    'Consider both renter and landlord claims.',
    'Consider evidence submitted by the renter and evidence submitted by the landlord.',
    'Do not assume either side is correct only because they provided evidence.',
    'Identify disputed facts and missing or weak evidence from both sides.',
    'Mention if one side appears to have stronger documentation than the other, but stay neutral and precise about limitations.',
    'Mention that any generated official form or PDF supports filing preparation only and is not an official filing.',
    'Do not claim to have visually inspected uploaded images unless the input explicitly states image bytes were provided.',
    imageEvidenceHandling,
    'Return ONLY valid JSON.',
    'Do not include markdown.',
    'Do not include ```json fences.',
    'Do not include explanatory text before or after the JSON.',
    'The JSON must exactly match this shape:',
    jsonShape,
    'The disclaimer must say the result is not legal advice and not a binding legal decision.'
  ].join(' ');

  const userContext = {
    caseId: context.caseId,
    disputeType: context.disputeType,
    selectedFilingPath: context.generatedForm?.selectedFilingPath || null,
    selectedOfficialFormName: context.generatedForm?.selectedFormName || null,
    generatedFormSummary: context.generatedForm
      ? {
          selectedFormType: context.generatedForm.selectedFormType,
          filingDestination: context.generatedForm.filingDestination,
          generatedFormData: context.generatedForm.generatedFormData,
          generatedPdfFilename: context.generatedForm.generatedPdfFilename,
          generatedPdfUrl: context.generatedForm.generatedPdfUrl
        }
      : null,
    propertyAddress: context.propertyAddress,
    amountRequested: context.amountRequested,
    securityDepositAmount: context.securityDepositAmount,
    relevantDates: {
      leaseStartDate: context.leaseStartDate,
      leaseEndDate: context.leaseEndDate,
      moveOutDate: context.moveOutDate
    },
    renterClaim: {
      renterName: context.renterFullName,
      renterEmail: context.renterEmail,
      renterPhone: context.renterPhone,
      disputeDescription: context.disputeDescription,
      evidenceDescription: context.evidenceDescription,
      evidenceFiles: context.renterEvidenceFiles,
      attachedImageFilenames: context.renterAttachedImageFilenames
    },
    landlordResponse: {
      landlordName: context.landlordResponse?.landlordFullName || context.landlordFullName,
      landlordEmail: context.landlordResponse?.landlordEmail || context.landlordEmail,
      responseStatement: context.landlordResponse?.responseStatement || null,
      amountLandlordClaims: context.landlordResponse?.amountLandlordClaims || null,
      evidenceDescription: context.landlordResponse?.evidenceDescription || null,
      evidenceFiles: context.landlordEvidenceFiles,
      attachedImageFilenames: context.landlordAttachedImageFilenames
    },
    imageAttachmentLimitations: context.imageAttachmentLimitations || [],
    instructions: {
      provider: aiConfig.provider,
      useMetadataOnlyForEvidenceImages: !context.imageEvidenceIncluded,
      disclaimerRequired:
        'This AI-generated result is not legal advice and is not a binding legal decision.'
    }
  };

  const userContent = [
    'Analyze the following case context and produce the required neutral arbitration JSON.',
    'Respond with a single valid JSON object only. Your response must be parseable by JSON.parse().',
    'Clearly separate: renter statement, renter text evidence description, renter uploaded evidence images, landlord response, landlord text evidence description, landlord uploaded evidence images, and generated official form information.',
    'Case context:',
    JSON.stringify(userContext, null, 2)
  ].join('\n\n');

  return {
    systemPrompt: systemContent,
    userPrompt: userContent,
    messages: [
      {
        role: 'system',
        content: systemContent
      },
      {
        role: 'user',
        content: userContent
      }
    ]
  };
}

module.exports = {
  buildArbitrationPrompt
};
