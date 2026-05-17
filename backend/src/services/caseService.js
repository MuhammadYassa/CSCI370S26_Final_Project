const { getPool } = require('../config/db');
const {
  ForbiddenError,
  NotFoundError
} = require('../utils/errors');
const { validateCaseInput } = require('../utils/validation');

const INITIAL_CASE_STATUS = 'INTAKE_SUBMITTED';

function mapCaseSummary(row) {
  return {
    caseId: row.id,
    status: row.status,
    disputeType: row.dispute_type,
    propertyAddress: row.property_address,
    amountRequested: row.amount_requested === null ? null : Number(row.amount_requested),
    createdAt: row.created_at
  };
}

function mapCaseDetail(row) {
  const generatedForm = mapGeneratedFormSummary(row);

  return {
    caseId: row.id,
    status: row.status,
    renterFullName: row.renter_full_name,
    renterEmail: row.renter_email,
    renterPhone: row.renter_phone,
    landlordFullName: row.landlord_full_name,
    landlordEmail: row.landlord_email,
    landlordPhone: row.landlord_phone,
    propertyAddress: row.property_address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    disputeType: row.dispute_type,
    securityDepositAmount:
      row.security_deposit_amount === null ? null : Number(row.security_deposit_amount),
    amountRequested: row.amount_requested === null ? null : Number(row.amount_requested),
    leaseStartDate: row.lease_start_date,
    leaseEndDate: row.lease_end_date,
    moveOutDate: row.move_out_date,
    disputeDescription: row.dispute_description,
    evidenceDescription: row.evidence_description,
    generatedForm,
    landlordResponse: null,
    arbitrationResult: null
  };
}

function parseJsonColumn(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return value;
}

function mapGeneratedFormSummary(row) {
  if (!row.generated_form_id) {
    return null;
  }

  return {
    id: row.generated_form_id,
    selectedFilingPath: row.generated_selected_filing_path,
    selectedFormType: row.generated_selected_form_type,
    selectedFormName:
      row.generated_selected_form_type === 'UNSUPPORTED_FORM_TYPE'
        ? null
        : row.generated_selected_form_name,
    filingDestination: row.generated_filing_destination,
    reasonSelected: row.generated_reason_selected,
    missingFields: parseJsonColumn(row.generated_missing_fields, []),
    generatedFormData: parseJsonColumn(row.generated_form_data, null),
    generatedPdfFilename: row.generated_pdf_filename,
    generatedPdfUrl: row.generated_pdf_url,
    filingInstructions: parseJsonColumn(row.generated_filing_instructions, []),
    createdAt: row.generated_created_at,
    updatedAt: row.generated_updated_at
  };
}

async function createCase(user, payload) {
  if (user.role !== 'RENTER') {
    throw new ForbiddenError('Only renters can create dispute cases.');
  }

  const input = validateCaseInput(payload);
  const pool = getPool();

  const [result] = await pool.execute(
    `
      INSERT INTO cases (
        renter_user_id,
        status,
        renter_full_name,
        renter_email,
        renter_phone,
        landlord_full_name,
        landlord_email,
        landlord_phone,
        property_address,
        city,
        state,
        zip_code,
        dispute_type,
        security_deposit_amount,
        amount_requested,
        lease_start_date,
        lease_end_date,
        move_out_date,
        dispute_description,
        evidence_description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      user.id,
      INITIAL_CASE_STATUS,
      input.renterFullName,
      input.renterEmail,
      input.renterPhone,
      input.landlordFullName,
      input.landlordEmail,
      input.landlordPhone,
      input.propertyAddress,
      input.city,
      input.state,
      input.zipCode,
      input.disputeType,
      input.securityDepositAmount,
      input.amountRequested,
      input.leaseStartDate,
      input.leaseEndDate,
      input.moveOutDate,
      input.disputeDescription,
      input.evidenceDescription
    ]
  );

  return {
    caseId: result.insertId,
    status: INITIAL_CASE_STATUS,
    message: 'Dispute case created successfully.'
  };
}

function userCanAccessCase(user, caseRow) {
  if (user.role === 'RENTER') {
    return caseRow.renter_user_id === user.id;
  }

  if (user.role === 'LANDLORD') {
    return caseRow.landlord_email === user.email;
  }

  return false;
}

async function getCaseRowById(caseId) {
  const numericCaseId = Number(caseId);
  if (!Number.isInteger(numericCaseId) || numericCaseId <= 0) {
    throw new NotFoundError('Case not found.');
  }

  const pool = getPool();
  const [rows] = await pool.execute(
    `
      SELECT
        c.*,
        gf.id AS generated_form_id,
        gf.selected_filing_path AS generated_selected_filing_path,
        gf.selected_form_type AS generated_selected_form_type,
        gf.selected_form_name AS generated_selected_form_name,
        gf.filing_destination AS generated_filing_destination,
        gf.reason_selected AS generated_reason_selected,
        gf.missing_fields AS generated_missing_fields,
        gf.generated_form_data AS generated_form_data,
        gf.generated_pdf_filename AS generated_pdf_filename,
        gf.generated_pdf_url AS generated_pdf_url,
        gf.filing_instructions AS generated_filing_instructions,
        gf.created_at AS generated_created_at,
        gf.updated_at AS generated_updated_at
      FROM cases c
      LEFT JOIN generated_forms gf ON gf.case_id = c.id
      WHERE c.id = ?
      LIMIT 1
    `,
    [numericCaseId]
  );

  const caseRow = rows[0];
  if (!caseRow) {
    throw new NotFoundError('Case not found.');
  }

  return caseRow;
}

async function getAuthorizedCaseRow(user, caseId) {
  const caseRow = await getCaseRowById(caseId);

  if (!userCanAccessCase(user, caseRow)) {
    throw new ForbiddenError('You do not have access to this case.');
  }

  return caseRow;
}

async function getRenterOwnedCaseRow(user, caseId) {
  if (user.role !== 'RENTER') {
    throw new ForbiddenError('Only the renter who owns this case can access this form workflow.');
  }

  const caseRow = await getCaseRowById(caseId);
  if (caseRow.renter_user_id !== user.id) {
    throw new ForbiddenError('You do not have access to this case.');
  }

  return caseRow;
}

async function getCasesForUser(user) {
  const pool = getPool();

  let rows;
  if (user.role === 'RENTER') {
    [rows] = await pool.execute(
      `
        SELECT id, status, dispute_type, property_address, amount_requested, created_at
        FROM cases
        WHERE renter_user_id = ?
        ORDER BY created_at DESC
      `,
      [user.id]
    );
  } else if (user.role === 'LANDLORD') {
    [rows] = await pool.execute(
      `
        SELECT id, status, dispute_type, property_address, amount_requested, created_at
        FROM cases
        WHERE landlord_email = ?
        ORDER BY created_at DESC
      `,
      [user.email]
    );
  } else {
    rows = [];
  }

  return {
    cases: rows.map(mapCaseSummary)
  };
}

async function getCaseByIdForUser(user, caseId) {
  const caseRow = await getAuthorizedCaseRow(user, caseId);
  return mapCaseDetail(caseRow);
}

async function updateCaseStatus(caseId, status) {
  await getPool().execute(
    `
      UPDATE cases
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [status, caseId]
  );
}

module.exports = {
  INITIAL_CASE_STATUS,
  createCase,
  getAuthorizedCaseRow,
  getRenterOwnedCaseRow,
  getCasesForUser,
  getCaseByIdForUser,
  updateCaseStatus
};
