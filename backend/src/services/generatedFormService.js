const path = require('path');
const { getPool } = require('../config/db');
const { NotFoundError } = require('../utils/errors');

function parseJsonColumn(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return value;
}

function mapGeneratedFormRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    caseId: row.case_id,
    selectedFilingPath: row.selected_filing_path,
    selectedFormType: row.selected_form_type,
    selectedFormName:
      row.selected_form_type === 'UNSUPPORTED_FORM_TYPE' ? null : row.selected_form_name,
    filingDestination: row.filing_destination,
    reasonSelected: row.reason_selected,
    missingFields: parseJsonColumn(row.missing_fields, []),
    generatedFormData: parseJsonColumn(row.generated_form_data, null),
    generatedPdfFilename: row.generated_pdf_filename,
    generatedPdfUrl: row.generated_pdf_url,
    officialSourceName: row.official_source_name,
    officialSourceUrl: row.official_source_url,
    filingInstructions: parseJsonColumn(row.filing_instructions, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getGeneratedFormByCaseId(caseId) {
  const [rows] = await getPool().execute(
    `
      SELECT *
      FROM generated_forms
      WHERE case_id = ?
      LIMIT 1
    `,
    [caseId]
  );

  return mapGeneratedFormRow(rows[0] || null);
}

async function getGeneratedFormRowById(generatedFormId) {
  const numericId = Number(generatedFormId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new NotFoundError('Generated form not found.');
  }

  const [rows] = await getPool().execute(
    `
      SELECT *
      FROM generated_forms
      WHERE id = ?
      LIMIT 1
    `,
    [numericId]
  );

  const row = rows[0];
  if (!row) {
    throw new NotFoundError('Generated form not found.');
  }

  return row;
}

async function upsertGeneratedForm(caseId, data) {
  const [result] = await getPool().execute(
    `
      INSERT INTO generated_forms (
        case_id,
        selected_filing_path,
        selected_form_type,
        selected_form_name,
        filing_destination,
        reason_selected,
        missing_fields,
        generated_form_data,
        generated_pdf_filename,
        generated_pdf_path,
        generated_pdf_url,
        official_source_name,
        official_source_url,
        filing_instructions
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        selected_filing_path = VALUES(selected_filing_path),
        selected_form_type = VALUES(selected_form_type),
        selected_form_name = VALUES(selected_form_name),
        filing_destination = VALUES(filing_destination),
        reason_selected = VALUES(reason_selected),
        missing_fields = VALUES(missing_fields),
        generated_form_data = VALUES(generated_form_data),
        generated_pdf_filename = VALUES(generated_pdf_filename),
        generated_pdf_path = VALUES(generated_pdf_path),
        generated_pdf_url = VALUES(generated_pdf_url),
        official_source_name = VALUES(official_source_name),
        official_source_url = VALUES(official_source_url),
        filing_instructions = VALUES(filing_instructions),
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      caseId,
      data.selectedFilingPath,
      data.selectedFormType,
      data.selectedFormName || '',
      data.filingDestination || null,
      data.reasonSelected || null,
      JSON.stringify(data.missingFields || []),
      data.generatedFormData ? JSON.stringify(data.generatedFormData) : null,
      data.generatedPdfFilename || null,
      data.generatedPdfPath || null,
      data.generatedPdfUrl || null,
      data.officialSourceName || null,
      data.officialSourceUrl || null,
      JSON.stringify(data.filingInstructions || [])
    ]
  );

  return result.insertId;
}

async function setGeneratedPdfUrl(generatedFormId, generatedPdfUrl) {
  await getPool().execute(
    `
      UPDATE generated_forms
      SET generated_pdf_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [generatedPdfUrl, generatedFormId]
  );
}

function buildGeneratedPdfUrl(generatedFormId) {
  return `/api/generated-forms/${generatedFormId}/file`;
}

function resolveGeneratedPdfAbsolutePath(generatedPdfPath) {
  const generatedFormsRoot = path.resolve(__dirname, '..', '..', 'generated', 'forms');
  const absolutePath = path.resolve(__dirname, '..', '..', generatedPdfPath);

  if (!absolutePath.startsWith(generatedFormsRoot)) {
    throw new NotFoundError('Generated form not found.');
  }

  return absolutePath;
}

module.exports = {
  buildGeneratedPdfUrl,
  getGeneratedFormByCaseId,
  getGeneratedFormRowById,
  mapGeneratedFormRow,
  resolveGeneratedPdfAbsolutePath,
  setGeneratedPdfUrl,
  upsertGeneratedForm
};
