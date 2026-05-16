const evidenceService = require('../services/evidenceService');

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

async function uploadEvidence(req, res) {
  const result = await evidenceService.uploadEvidenceFiles(
    req.user,
    req.params.caseId,
    req.files,
    getBaseUrl(req)
  );

  res.status(201).json(result);
}

async function listEvidence(req, res) {
  const result = await evidenceService.getEvidenceForCase(
    req.user,
    req.params.caseId,
    getBaseUrl(req)
  );

  res.json(result);
}

async function getEvidenceFile(req, res) {
  const file = await evidenceService.getEvidenceFileForUser(
    req.user,
    req.params.evidenceId
  );

  res.type(file.mimeType);
  res.sendFile(file.absolutePath, {
    headers: {
      'Content-Disposition': `inline; filename="${encodeURIComponent(file.originalFilename)}"`
    }
  });
}

module.exports = {
  uploadEvidence,
  listEvidence,
  getEvidenceFile
};
