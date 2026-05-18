const { getPool } = require('../config/db');
const caseService = require('./caseService');
const {
  ForbiddenError,
  ValidationError
} = require('../utils/errors');
const {
  normalizeEmail,
  validateLandlordResponseInput
} = require('../utils/validation');

function mapLandlordResponseRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    caseId: row.case_id,
    landlordUserId: row.landlord_user_id,
    landlordFullName: row.landlord_full_name,
    landlordEmail: row.landlord_email,
    responseStatement: row.response_statement,
    amountLandlordClaims:
      row.amount_landlord_claims === null ? null : Number(row.amount_landlord_claims),
    evidenceDescription: row.evidence_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getLandlordResponseByCaseId(caseId) {
  const [rows] = await getPool().execute(
    `
      SELECT *
      FROM landlord_responses
      WHERE case_id = ?
      LIMIT 1
    `,
    [caseId]
  );

  return mapLandlordResponseRow(rows[0] || null);
}

function ensureMatchingLandlordUser(user, caseRow, inputEmail) {
  if (user.role !== 'LANDLORD') {
    throw new ForbiddenError('Only the matching landlord can submit a landlord response.');
  }

  if (normalizeEmail(caseRow.landlord_email) !== normalizeEmail(user.email)) {
    throw new ForbiddenError('You do not have access to this case.');
  }

  if (inputEmail !== normalizeEmail(user.email) || inputEmail !== normalizeEmail(caseRow.landlord_email)) {
    throw new ValidationError('Please correct the highlighted fields.', {
      landlordEmail: 'Landlord email must match the logged-in landlord account and the case landlord email.'
    });
  }
}

async function saveLandlordResponse(user, caseId, payload) {
  const caseRow = await caseService.getCaseRowById(caseId);
  const input = validateLandlordResponseInput(payload);

  ensureMatchingLandlordUser(user, caseRow, input.landlordEmail);

  const [result] = await getPool().execute(
    `
      INSERT INTO landlord_responses (
        case_id,
        landlord_user_id,
        landlord_full_name,
        landlord_email,
        response_statement,
        amount_landlord_claims,
        evidence_description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        landlord_user_id = VALUES(landlord_user_id),
        landlord_full_name = VALUES(landlord_full_name),
        landlord_email = VALUES(landlord_email),
        response_statement = VALUES(response_statement),
        amount_landlord_claims = VALUES(amount_landlord_claims),
        evidence_description = VALUES(evidence_description),
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      caseRow.id,
      user.id,
      input.landlordFullName,
      input.landlordEmail,
      input.responseStatement,
      input.amountLandlordClaims,
      input.evidenceDescription
    ]
  );

  await caseService.updateCaseStatus(caseRow.id, 'LANDLORD_RESPONSE_SUBMITTED');

  const savedResponse = await getLandlordResponseByCaseId(caseRow.id);

  return {
    caseId: caseRow.id,
    status: 'LANDLORD_RESPONSE_SUBMITTED',
    message: 'Landlord response saved successfully.',
    landlordResponse: savedResponse || { id: result.insertId }
  };
}

async function getLandlordResponseForUser(user, caseId) {
  const caseRow = await caseService.getAuthorizedCaseRow(user, caseId);
  const landlordResponse = await getLandlordResponseByCaseId(caseRow.id);

  return {
    caseId: caseRow.id,
    landlordResponse,
    message: landlordResponse
      ? undefined
      : 'No landlord response has been submitted yet.'
  };
}

module.exports = {
  getLandlordResponseByCaseId,
  getLandlordResponseForUser,
  mapLandlordResponseRow,
  saveLandlordResponse
};
