const caseService = require('../services/caseService');

async function createCase(req, res) {
  const result = await caseService.createCase(req.user, req.body);
  res.status(201).json(result);
}

async function listCases(req, res) {
  const result = await caseService.getCasesForUser(req.user);
  res.json(result);
}

async function getCaseById(req, res) {
  const result = await caseService.getCaseByIdForUser(req.user, req.params.caseId);
  res.json(result);
}

module.exports = {
  createCase,
  listCases,
  getCaseById
};
