const landlordResponseService = require('../services/landlordResponseService');

async function saveLandlordResponse(req, res) {
  const result = await landlordResponseService.saveLandlordResponse(
    req.user,
    req.params.caseId,
    req.body
  );

  res.json(result);
}

async function getLandlordResponse(req, res) {
  const result = await landlordResponseService.getLandlordResponseForUser(
    req.user,
    req.params.caseId
  );

  res.json(result);
}

module.exports = {
  getLandlordResponse,
  saveLandlordResponse
};
