const fs = require('fs/promises');
const { getAiConfig } = require('../config/aiConfig');
const caseService = require('./caseService');
const evidenceService = require('./evidenceService');
const generatedFormService = require('./generatedFormService');
const landlordResponseService = require('./landlordResponseService');
const arbitrationResultService = require('./arbitrationResultService');
const aiClientService = require('./aiClientService');
const { buildArbitrationPrompt } = require('./arbitrationPromptService');
const { AiApiError } = require('../utils/errors');
const { validateArbitrationRequestInput } = require('../utils/validation');

const REQUIRED_ARRAY_FIELDS = [
  'renterMainClaims',
  'landlordMainClaims',
  'keyDisputedFacts',
  'missingEvidence',
  'recommendedNextSteps'
];

const SUPPORTED_GEMINI_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

function stripMarkdownCodeFences(value) {
  const trimmed = String(value || '').trim();

  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function normalizeStringArray(values) {
  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean);
}

function normalizeImageEvidenceFindings(value) {
  const findings = value && typeof value === 'object' ? value : {};

  return {
    renterEvidence: normalizeStringArray(Array.isArray(findings.renterEvidence) ? findings.renterEvidence : []),
    landlordEvidence: normalizeStringArray(Array.isArray(findings.landlordEvidence) ? findings.landlordEvidence : []),
    limitations: normalizeStringArray(Array.isArray(findings.limitations) ? findings.limitations : [])
  };
}

function validateArbitrationPayload(payload) {
  const requiredStringFields = [
    'neutralSummary',
    'suggestedResolution',
    'confidenceLevel',
    'disclaimer'
  ];

  for (const field of requiredStringFields) {
    if (typeof payload[field] !== 'string' || payload[field].trim() === '') {
      throw new AiApiError('The AI arbitration provider returned an incomplete result.');
    }
  }

  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(payload[field])) {
      throw new AiApiError('The AI arbitration provider returned an invalid result format.');
    }
  }

  const imageEvidenceFindings = payload.imageEvidenceFindings;
  if (!imageEvidenceFindings || typeof imageEvidenceFindings !== 'object') {
    throw new AiApiError('The AI arbitration provider returned invalid image evidence findings.');
  }

  const confidenceLevel = payload.confidenceLevel.trim().toUpperCase();
  if (!['LOW', 'MEDIUM', 'HIGH'].includes(confidenceLevel)) {
    throw new AiApiError('The AI arbitration provider returned an invalid confidence level.');
  }

  const disclaimer = payload.disclaimer.trim().toLowerCase();
  if (!disclaimer.includes('not legal advice') || !disclaimer.includes('not a binding')) {
    throw new AiApiError('The AI arbitration provider returned an invalid disclaimer.');
  }

  return {
    neutralSummary: payload.neutralSummary.trim(),
    renterMainClaims: normalizeStringArray(payload.renterMainClaims),
    landlordMainClaims: normalizeStringArray(payload.landlordMainClaims),
    imageEvidenceFindings: normalizeImageEvidenceFindings(imageEvidenceFindings),
    keyDisputedFacts: normalizeStringArray(payload.keyDisputedFacts),
    missingEvidence: normalizeStringArray(payload.missingEvidence),
    suggestedResolution: payload.suggestedResolution.trim(),
    recommendedNextSteps: normalizeStringArray(payload.recommendedNextSteps),
    confidenceLevel,
    disclaimer: payload.disclaimer.trim()
  };
}

function extractJsonObjectFromText(text) {
  const trimmed = stripMarkdownCodeFences(text).trim();
  const firstBraceIndex = trimmed.indexOf('{');
  const lastBraceIndex = trimmed.lastIndexOf('}');

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex < firstBraceIndex) {
    throw new AiApiError('The AI arbitration provider returned invalid JSON content.');
  }

  const candidate = trimmed.slice(firstBraceIndex, lastBraceIndex + 1);

  try {
    return JSON.parse(candidate);
  } catch (error) {
    throw new AiApiError('The AI arbitration provider returned invalid JSON content.');
  }
}

function parseArbitrationContent(content) {
  const normalizedContent = String(content || '').trim();
  let parsed;

  try {
    parsed = JSON.parse(normalizedContent);
  } catch (error) {
    parsed = extractJsonObjectFromText(normalizedContent);
  }

  if (typeof parsed === 'string') {
    const nestedString = parsed.trim();

    try {
      parsed = JSON.parse(nestedString);
    } catch (error) {
      parsed = extractJsonObjectFromText(nestedString);
    }
  }

  return validateArbitrationPayload(parsed);
}

function mapEvidenceForArbitration(file) {
  return {
    id: file.evidenceId,
    originalFilename: file.originalFilename,
    mimeType: file.mimeType,
    fileSizeBytes: file.fileSizeBytes,
    url: file.fileUrl,
    uploadedByUserId: file.uploadedByUserId,
    uploadedByRole: file.uploadedByRole,
    createdAt: file.createdAt
  };
}

async function buildGeminiImagePartsForSide(files, roleLabel, config) {
  const attachments = [];
  const limitations = [];
  const attachedFilenames = [];
  let skippedForLimit = 0;

  for (const file of files) {
    if (!SUPPORTED_GEMINI_IMAGE_MIME_TYPES.has(file.mimeType)) {
      limitations.push(
        `${roleLabel} evidence file "${file.originalFilename}" was not attached because its type is unsupported for Gemini image input.`
      );
      continue;
    }

    if (attachments.length >= config.maxImagesPerSide) {
      skippedForLimit += 1;
      continue;
    }

    if (!file.absolutePath) {
      limitations.push(
        `${roleLabel} evidence file "${file.originalFilename}" could not be attached because its stored path was invalid.`
      );
      continue;
    }

    try {
      const fileBuffer = await fs.readFile(file.absolutePath);
      attachments.push({
        originalFilename: file.originalFilename,
        part: {
          inlineData: {
            mimeType: file.mimeType,
            data: fileBuffer.toString('base64')
          }
        }
      });
      attachedFilenames.push(file.originalFilename);
    } catch (error) {
      limitations.push(
        `${roleLabel} evidence file "${file.originalFilename}" could not be read from disk and was not attached to the AI request.`
      );
    }
  }

  if (skippedForLimit > 0) {
    limitations.push(
      `Only the first ${config.maxImagesPerSide} ${roleLabel.toLowerCase()} image files were attached to the AI request.`
    );
  }

  return {
    attachments,
    limitations,
    attachedFilenames
  };
}

async function prepareImageEvidencePayload(evidenceFiles, config) {
  const renterEvidenceFiles = evidenceFiles.filter((file) => file.uploadedByRole === 'RENTER');
  const landlordEvidenceFiles = evidenceFiles.filter((file) => file.uploadedByRole === 'LANDLORD');

  const imageAttachmentLimitations = [];
  let renterImages = [];
  let landlordImages = [];
  let renterAttachedImageFilenames = [];
  let landlordAttachedImageFilenames = [];

  const shouldAttachImages = config.provider === 'GEMINI' && config.includeImageEvidence;

  if (shouldAttachImages) {
    const renterImagePayload = await buildGeminiImagePartsForSide(
      renterEvidenceFiles,
      'Renter',
      config
    );
    const landlordImagePayload = await buildGeminiImagePartsForSide(
      landlordEvidenceFiles,
      'Landlord',
      config
    );

    renterImages = renterImagePayload.attachments;
    landlordImages = landlordImagePayload.attachments;
    renterAttachedImageFilenames = renterImagePayload.attachedFilenames;
    landlordAttachedImageFilenames = landlordImagePayload.attachedFilenames;
    imageAttachmentLimitations.push(
      ...renterImagePayload.limitations,
      ...landlordImagePayload.limitations
    );
  } else if (config.includeImageEvidence) {
    imageAttachmentLimitations.push(
      'Image evidence sending was requested, but this AI provider is configured for text-only arbitration in the current backend implementation.'
    );
  } else {
    imageAttachmentLimitations.push(
      'Image evidence was not attached because AI_INCLUDE_IMAGE_EVIDENCE is false.'
    );
  }

  return {
    renterEvidenceFiles,
    landlordEvidenceFiles,
    imageEvidenceIncluded: renterImages.length > 0 || landlordImages.length > 0,
    imageAttachmentLimitations,
    renterAttachedImageFilenames,
    landlordAttachedImageFilenames,
    imageEvidence: {
      renterImages,
      landlordImages
    }
  };
}

async function buildArbitrationContext(user, caseId) {
  const config = getAiConfig();
  const caseRecord = await caseService.getCaseByIdForUser(user, caseId);
  const landlordResponse = await landlordResponseService.getLandlordResponseByCaseId(caseRecord.caseId);

  if (!landlordResponse) {
    return {
      caseRecord,
      landlordResponse: null,
      arbitrationContext: null,
      imageEvidence: {
        renterImages: [],
        landlordImages: []
      }
    };
  }

  const [generatedForm, evidenceFiles] = await Promise.all([
    generatedFormService.getGeneratedFormByCaseId(caseRecord.caseId),
    evidenceService.getEvidenceReferencesForCase(caseRecord.caseId)
  ]);

  const preparedImageEvidence = await prepareImageEvidencePayload(evidenceFiles, config);
  const renterEvidenceFiles = preparedImageEvidence.renterEvidenceFiles.map(mapEvidenceForArbitration);
  const landlordEvidenceFiles = preparedImageEvidence.landlordEvidenceFiles.map(mapEvidenceForArbitration);

  return {
    caseRecord,
    landlordResponse,
    imageEvidence: preparedImageEvidence.imageEvidence,
    arbitrationContext: {
      ...caseRecord,
      generatedForm,
      landlordResponse,
      renterEvidenceFiles,
      landlordEvidenceFiles,
      imageEvidenceIncluded: preparedImageEvidence.imageEvidenceIncluded,
      imageEvidenceSetting: config.includeImageEvidence,
      renterAttachedImageFilenames: preparedImageEvidence.renterAttachedImageFilenames,
      landlordAttachedImageFilenames: preparedImageEvidence.landlordAttachedImageFilenames,
      imageAttachmentLimitations: preparedImageEvidence.imageAttachmentLimitations
    }
  };
}

async function generateArbitrationForCase(user, caseId, payload) {
  validateArbitrationRequestInput(payload);

  const { caseRecord, landlordResponse, arbitrationContext, imageEvidence } =
    await buildArbitrationContext(user, caseId);

  if (!landlordResponse) {
    return {
      caseId: caseRecord.caseId,
      status: 'ARBITRATION_NOT_READY',
      missingFields: ['landlordResponse'],
      message: 'A landlord response is required before AI arbitration can be generated.'
    };
  }

  const prompt = buildArbitrationPrompt(arbitrationContext);
  const aiResponse = await aiClientService.requestStructuredArbitration({
    prompt,
    imageEvidence
  });
  const parsedResult = parseArbitrationContent(aiResponse.content);

  let savedResult;
  try {
    await arbitrationResultService.upsertArbitrationResult(caseRecord.caseId, {
      ...parsedResult,
      rawAiResponse: aiResponse.providerResponse,
      aiModel: aiResponse.model
    });

    await caseService.updateCaseStatus(caseRecord.caseId, 'ARBITRATION_COMPLETE');
    savedResult = await arbitrationResultService.getArbitrationResultByCaseId(caseRecord.caseId);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[arbitrationService] Failed to save arbitration result:', error);
    }

    throw new AiApiError(
      'The AI arbitration result was generated but could not be saved.'
    );
  }

  return {
    caseId: caseRecord.caseId,
    status: 'ARBITRATION_COMPLETE',
    arbitrationResult: savedResult
  };
}

async function getArbitrationForUser(user, caseId) {
  const caseRecord = await caseService.getCaseByIdForUser(user, caseId);
  const arbitrationResult = await arbitrationResultService.getArbitrationResultByCaseId(
    caseRecord.caseId
  );

  if (!arbitrationResult) {
    return {
      caseId: caseRecord.caseId,
      status: 'NO_ARBITRATION_RESULT',
      arbitrationResult: null,
      message: 'No AI arbitration result has been generated yet.'
    };
  }

  return {
    caseId: caseRecord.caseId,
    status:
      caseRecord.status === 'ARBITRATION_COMPLETE'
        ? caseRecord.status
        : 'ARBITRATION_COMPLETE',
    arbitrationResult
  };
}

module.exports = {
  extractJsonObjectFromText,
  generateArbitrationForCase,
  getArbitrationForUser
};
