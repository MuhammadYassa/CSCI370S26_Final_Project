const express = require('express');
const caseController = require('../controllers/caseController');
const evidenceController = require('../controllers/evidenceController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireCaseAccess } = require('../middleware/caseAccessMiddleware');
const { evidenceUploadMiddleware } = require('../middleware/uploadMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/cases', asyncHandler(caseController.listCases));
router.post('/cases', asyncHandler(caseController.createCase));
router.get('/cases/:caseId', asyncHandler(caseController.getCaseById));
router.post(
  '/cases/:caseId/evidence',
  requireCaseAccess,
  evidenceUploadMiddleware.array('evidenceImages'),
  asyncHandler(evidenceController.uploadEvidence)
);
router.get(
  '/cases/:caseId/evidence',
  requireCaseAccess,
  asyncHandler(evidenceController.listEvidence)
);
router.get(
  '/evidence/:evidenceId/file',
  asyncHandler(evidenceController.getEvidenceFile)
);

module.exports = router;
