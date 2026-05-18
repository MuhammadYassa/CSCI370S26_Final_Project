const express = require('express');
const caseController = require('../controllers/caseController');
const evidenceController = require('../controllers/evidenceController');
const formController = require('../controllers/formController');
const landlordResponseController = require('../controllers/landlordResponseController');
const arbitrationController = require('../controllers/arbitrationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  requireCaseAccess,
  requireRenterOwnedCaseAccess
} = require('../middleware/caseAccessMiddleware');
const { evidenceUploadMiddleware } = require('../middleware/uploadMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/cases', asyncHandler(caseController.listCases));
router.post('/cases', asyncHandler(caseController.createCase));
router.get('/cases/:caseId', asyncHandler(caseController.getCaseById));
router.post(
  '/cases/:caseId/landlord-response',
  asyncHandler(landlordResponseController.saveLandlordResponse)
);
router.get(
  '/cases/:caseId/landlord-response',
  asyncHandler(landlordResponseController.getLandlordResponse)
);
router.post(
  '/cases/:caseId/arbitration',
  asyncHandler(arbitrationController.generateArbitration)
);
router.get(
  '/cases/:caseId/arbitration',
  asyncHandler(arbitrationController.getArbitration)
);
router.get(
  '/cases/:caseId/form-requirements',
  requireRenterOwnedCaseAccess,
  asyncHandler(formController.getFormRequirements)
);
router.patch(
  '/cases/:caseId/form-answers',
  requireRenterOwnedCaseAccess,
  asyncHandler(formController.saveFormAnswers)
);
router.post(
  '/cases/:caseId/generate-form',
  requireRenterOwnedCaseAccess,
  asyncHandler(formController.generateForm)
);
router.get(
  '/cases/:caseId/generated-form',
  requireRenterOwnedCaseAccess,
  asyncHandler(formController.getGeneratedFormMetadata)
);
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
router.get(
  '/generated-forms/:generatedFormId/file',
  asyncHandler(formController.downloadGeneratedFormFile)
);

module.exports = router;
