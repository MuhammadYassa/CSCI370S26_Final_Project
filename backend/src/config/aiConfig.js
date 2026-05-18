const { AiApiError } = require('../utils/errors');

function parseBooleanEnv(value, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function parseIntegerEnv(value, defaultValue) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
}

function normalizeAiProvider(value, apiUrl) {
  const normalized = String(value || '').trim().toUpperCase();

  if (normalized) {
    return normalized;
  }

  if (String(apiUrl || '').includes('generativelanguage.googleapis.com')) {
    return 'GEMINI';
  }

  return 'OPENAI_COMPATIBLE';
}

function getAiConfig() {
  const apiUrl = process.env.AI_API_URL || '';

  return {
    provider: normalizeAiProvider(process.env.AI_PROVIDER, apiUrl),
    apiKey: process.env.AI_API_KEY || '',
    apiUrl,
    model: process.env.AI_MODEL || '',
    timeoutMs: parseIntegerEnv(process.env.AI_TIMEOUT_MS, 30000),
    includeImageEvidence: parseBooleanEnv(process.env.AI_INCLUDE_IMAGE_EVIDENCE, false),
    maxImagesPerSide: parseIntegerEnv(process.env.AI_MAX_IMAGES_PER_SIDE, 3),
    useStructuredOutput: parseBooleanEnv(
      process.env.AI_USE_STRUCTURED_OUTPUT ?? process.env.AI_USE_RESPONSE_FORMAT,
      true
    )
  };
}

function assertAiConfigured() {
  const config = getAiConfig();

  if (!config.apiKey || !config.apiUrl || !config.model) {
    throw new AiApiError(
      'AI arbitration is not configured. Please set AI_API_KEY, AI_API_URL, and AI_MODEL.',
      500
    );
  }

  return config;
}

module.exports = {
  assertAiConfigured,
  getAiConfig
};
