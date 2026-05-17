const caseService = require('../services/caseService');
const fs = require('fs');
const formAnswerService = require('../services/formAnswerService');
const formGenerationService = require('../services/formGenerationService');
const formRequirementService = require('../services/formRequirementService');
const generatedFormService = require('../services/generatedFormService');

async function getFormRequirements(req, res) {
  const result = await formRequirementService.getFormRequirements(req.user, req.params.caseId);
  res.json(result);
}

async function saveFormAnswers(req, res) {
  const caseRecord = await caseService.getRenterOwnedCaseRow(req.user, req.params.caseId);
  const answers = await formAnswerService.saveFormAnswers(caseRecord.id, req.body);

  res.json({
    caseId: caseRecord.id,
    message: 'Form answers saved successfully.',
    answers
  });
}

async function generateForm(req, res) {
  const result = await formGenerationService.generateFormForCase(
    req.user,
    req.params.caseId,
    req.body
  );
  res.json(result);
}

async function getGeneratedFormMetadata(req, res) {
  const caseRecord = await caseService.getRenterOwnedCaseRow(req.user, req.params.caseId);
  const generatedForm = await generatedFormService.getGeneratedFormByCaseId(caseRecord.id);

  if (!generatedForm) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Generated form not found.'
      }
    });
    return;
  }

  res.json(generatedForm);
}

async function downloadGeneratedFormFile(req, res) {
  const generatedFormRow = await generatedFormService.getGeneratedFormRowById(
    req.params.generatedFormId
  );

  await caseService.getAuthorizedCaseRow(req.user, generatedFormRow.case_id);

  if (!generatedFormRow.generated_pdf_path || !generatedFormRow.generated_pdf_filename) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Generated PDF file not found.'
      }
    });
    return;
  }

  const absolutePath = generatedFormService.resolveGeneratedPdfAbsolutePath(
    generatedFormRow.generated_pdf_path
  );

  if (!fs.existsSync(absolutePath)) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Generated PDF file not found.'
      }
    });
    return;
  }

  res.type('application/pdf');
  res.sendFile(absolutePath, {
    headers: {
      'Content-Disposition': `inline; filename="${encodeURIComponent(generatedFormRow.generated_pdf_filename)}"`
    }
  });
}

module.exports = {
  downloadGeneratedFormFile,
  generateForm,
  getFormRequirements,
  getGeneratedFormMetadata,
  saveFormAnswers
};
