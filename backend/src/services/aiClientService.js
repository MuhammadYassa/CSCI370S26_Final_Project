const { assertAiConfigured } = require('../config/aiConfig');
const { AiApiError } = require('../utils/errors');

function extractMessageContent(messageContent) {
  if (typeof messageContent === 'string') {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item.text === 'string') {
          return item.text;
        }

        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

function debugLog(label, value) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(label, value);
  }
}

function buildGeminiUrl(apiUrl, model) {
  const baseUrl = String(apiUrl || '').replace(/\/+$/, '');
  const normalizedModel = String(model || '').replace(/^models\//, '');
  return `${baseUrl}/models/${normalizedModel}:generateContent`;
}

async function parseProviderBody(response) {
  const responseText = await response.text();
  debugLog('[aiClientService] Raw provider response body:', responseText);

  try {
    return {
      providerBody: responseText ? JSON.parse(responseText) : null,
      responseText
    };
  } catch (error) {
    if (!response.ok) {
      throw new AiApiError(
        `The AI arbitration provider returned a non-JSON error response with status ${response.status}.`
      );
    }

    throw new AiApiError('The AI arbitration provider returned invalid JSON.');
  }
}

function extractOpenAiContent(providerBody) {
  const content = providerBody?.choices?.[0]?.message?.content;

  if (content === undefined) {
    throw new AiApiError(
      'The AI arbitration provider returned an unexpected response shape. Expected choices[0].message.content.'
    );
  }

  const parsedContent = extractMessageContent(content);
  debugLog('[aiClientService] Raw AI content:', parsedContent);

  if (!parsedContent) {
    throw new AiApiError('The AI arbitration provider returned an empty response.');
  }

  return parsedContent;
}

function extractGeminiContent(providerBody) {
  const parts = providerBody?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    throw new AiApiError(
      'The AI arbitration provider returned an unexpected Gemini response shape. Expected candidates[0].content.parts.'
    );
  }

  const parsedContent = parts
    .map((part) => (part && typeof part.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();

  debugLog('[aiClientService] Raw AI content:', parsedContent);

  if (!parsedContent) {
    throw new AiApiError('The AI arbitration provider returned an empty response.');
  }

  return parsedContent;
}

async function requestOpenAiCompatibleArbitration(prompt, config, signal) {
  const requestBody = {
    model: config.model,
    messages: prompt.messages,
    temperature: 0.2
  };

  if (config.useStructuredOutput) {
    requestBody.response_format = {
      type: 'json_object'
    };
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    signal
  });

  const { providerBody } = await parseProviderBody(response);

  if (!response.ok) {
    throw new AiApiError(
      `The AI arbitration provider request failed with status ${response.status}.`
    );
  }

  return {
    providerResponse: providerBody,
    content: extractOpenAiContent(providerBody),
    model: providerBody?.model || config.model
  };
}

function buildGeminiUserParts(prompt, imageEvidence) {
  const userParts = [{ text: prompt.userPrompt }];

  if (imageEvidence.renterImages.length > 0) {
    userParts.push({ text: 'Renter uploaded evidence images begin now.' });
    userParts.push(...imageEvidence.renterImages.map((image) => image.part));
  }

  if (imageEvidence.landlordImages.length > 0) {
    userParts.push({ text: 'Landlord uploaded evidence images begin now.' });
    userParts.push(...imageEvidence.landlordImages.map((image) => image.part));
  }

  return userParts;
}

async function requestGeminiArbitration(prompt, imageEvidence, config, signal) {
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: buildGeminiUserParts(prompt, imageEvidence)
      }
    ],
    generationConfig: {
      temperature: 0.2
    }
  };

  if (prompt.systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: prompt.systemPrompt }]
    };
  }

  if (config.useStructuredOutput) {
    requestBody.generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(buildGeminiUrl(config.apiUrl, config.model), {
    method: 'POST',
    headers: {
      'x-goog-api-key': config.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    signal
  });

  const { providerBody } = await parseProviderBody(response);

  if (!response.ok) {
    throw new AiApiError(
      `The AI arbitration provider request failed with status ${response.status}.`
    );
  }

  return {
    providerResponse: providerBody,
    content: extractGeminiContent(providerBody),
    model: providerBody?.modelVersion || config.model
  };
}

async function requestStructuredArbitration({ prompt, imageEvidence }) {
  const config = assertAiConfigured();
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    if (config.provider === 'GEMINI') {
      return await requestGeminiArbitration(
        prompt,
        imageEvidence || { renterImages: [], landlordImages: [] },
        config,
        controller.signal
      );
    }

    return await requestOpenAiCompatibleArbitration(prompt, config, controller.signal);
  } catch (error) {
    if (error instanceof AiApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new AiApiError('The AI arbitration provider request timed out.');
    }

    throw new AiApiError('The AI arbitration provider request could not be completed.');
  } finally {
    clearTimeout(timeoutHandle);
  }
}

module.exports = {
  requestStructuredArbitration
};
