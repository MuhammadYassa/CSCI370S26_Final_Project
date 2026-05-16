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
    generatedForm: null,
    landlordResponse: null,
    arbitrationResult: null
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
      SELECT *
      FROM cases
      WHERE id = ?
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

module.exports = {
  INITIAL_CASE_STATUS,
  createCase,
  getAuthorizedCaseRow,
  getCasesForUser,
  getCaseByIdForUser
};
