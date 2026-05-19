const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
const AUTH_STORAGE_KEY = 'renter-dispute-auth';

export class ApiError extends Error {
  constructor(message, status, code, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields || {};
  }
}

function getStoredToken() {
  try {
    const session = JSON.parse(
      window.localStorage.getItem(AUTH_STORAGE_KEY) || 'null'
    );

    return session?.token || null;
  } catch {
    return null;
  }
}

function resolveUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith('/api/')) {
    return `${API_ORIGIN}${path}`;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

async function request(path, options = {}) {
  const {
    body,
    headers = {},
    isFormData = false,
    method = 'GET'
  } = options;

  const token = getStoredToken();
  const nextHeaders = { ...headers };

  if (!isFormData) {
    nextHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(resolveUrl(path), {
    method,
    headers: nextHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body)
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const error = payload?.error;

    throw new ApiError(
      error?.message || 'Request failed.',
      response.status,
      error?.code || 'REQUEST_FAILED',
      error?.fields
    );
  }

  return payload;
}

async function downloadProtectedFile(path, filenameHint) {
  const token = getStoredToken();
  const response = await fetch(resolveUrl(path), {
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
  });

  if (!response.ok) {
    let message = 'Download failed.';

    try {
      const payload = await response.json();
      message = payload?.error?.message || message;
    } catch {
      // Ignore JSON parse failure for binary responses.
    }

    throw new ApiError(message, response.status, 'DOWNLOAD_FAILED');
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filenameHint || 'download';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 1000);
}

export const api = {
  register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: payload
    });
  },
  login(payload) {
    return request('/auth/login', {
      method: 'POST',
      body: payload
    });
  },
  getMe() {
    return request('/me');
  },
  getCases() {
    return request('/cases');
  },
  createCase(payload) {
    return request('/cases', {
      method: 'POST',
      body: payload
    });
  },
  getCase(caseId) {
    return request(`/cases/${caseId}`);
  },
  getFormRequirements(caseId) {
    return request(`/cases/${caseId}/form-requirements`);
  },
  saveFormAnswers(caseId, answers) {
    return request(`/cases/${caseId}/form-answers`, {
      method: 'PATCH',
      body: { answers }
    });
  },
  generateForm(caseId) {
    return request(`/cases/${caseId}/generate-form`, {
      method: 'POST',
      body: { confirmGenerate: true }
    });
  },
  getLandlordResponse(caseId) {
    return request(`/cases/${caseId}/landlord-response`);
  },
  saveLandlordResponse(caseId, payload) {
    return request(`/cases/${caseId}/landlord-response`, {
      method: 'POST',
      body: payload
    });
  },
  getArbitration(caseId) {
    return request(`/cases/${caseId}/arbitration`);
  },
  generateArbitration(caseId) {
    return request(`/cases/${caseId}/arbitration`, {
      method: 'POST',
      body: { confirmArbitration: true }
    });
  },
  getEvidence(caseId) {
    return request(`/cases/${caseId}/evidence`);
  },
  async uploadEvidence(caseId, files) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('evidenceImages', file);
    });

    return request(`/cases/${caseId}/evidence`, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },
  downloadEvidence(fileUrl, originalFilename) {
    return downloadProtectedFile(fileUrl, originalFilename);
  },
  downloadGeneratedForm(path, filename) {
    return downloadProtectedFile(path, filename || 'generated-form.pdf');
  }
};
