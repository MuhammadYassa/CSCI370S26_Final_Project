const caseService = require('../services/caseService');

async function requireCaseAccess(req, res, next) {
  try {
    req.caseRecord = await caseService.getAuthorizedCaseRow(req.user, req.params.caseId);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireCaseAccess
};
