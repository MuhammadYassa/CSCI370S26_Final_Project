const arbitrationService = require('../services/arbitrationService');

async function generateArbitration(req, res) {
  const result = await arbitrationService.generateArbitrationForCase(
    req.user,
    req.params.caseId,
    req.body
  );

  res.json(result);
}

async function getArbitration(req, res) {
  const result = await arbitrationService.getArbitrationForUser(req.user, req.params.caseId);
  res.json(result);
}

module.exports = {
  generateArbitration,
  getArbitration
};
