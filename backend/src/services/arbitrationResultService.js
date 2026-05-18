const { getPool } = require('../config/db');

function parseJsonColumn(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return value;
}

function mapArbitrationResultRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    caseId: row.case_id,
    neutralSummary: row.neutral_summary,
    renterMainClaims: parseJsonColumn(row.renter_main_claims, []),
    landlordMainClaims: parseJsonColumn(row.landlord_main_claims, []),
    imageEvidenceFindings: parseJsonColumn(row.image_evidence_findings, {
      renterEvidence: [],
      landlordEvidence: [],
      limitations: []
    }),
    keyDisputedFacts: parseJsonColumn(row.key_disputed_facts, []),
    missingEvidence: parseJsonColumn(row.missing_evidence, []),
    suggestedResolution: row.suggested_resolution,
    recommendedNextSteps: parseJsonColumn(row.recommended_next_steps, []),
    confidenceLevel: row.confidence_level,
    disclaimer: row.disclaimer,
    aiModel: row.ai_model,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getArbitrationResultByCaseId(caseId) {
  const [rows] = await getPool().execute(
    `
      SELECT *
      FROM arbitration_results
      WHERE case_id = ?
      LIMIT 1
    `,
    [caseId]
  );

  return mapArbitrationResultRow(rows[0] || null);
}

async function upsertArbitrationResult(caseId, result) {
  const [dbResult] = await getPool().execute(
    `
      INSERT INTO arbitration_results (
        case_id,
        neutral_summary,
        renter_main_claims,
        landlord_main_claims,
        image_evidence_findings,
        key_disputed_facts,
        missing_evidence,
        suggested_resolution,
        recommended_next_steps,
        confidence_level,
        disclaimer,
        raw_ai_response,
        ai_model
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        neutral_summary = VALUES(neutral_summary),
        renter_main_claims = VALUES(renter_main_claims),
        landlord_main_claims = VALUES(landlord_main_claims),
        image_evidence_findings = VALUES(image_evidence_findings),
        key_disputed_facts = VALUES(key_disputed_facts),
        missing_evidence = VALUES(missing_evidence),
        suggested_resolution = VALUES(suggested_resolution),
        recommended_next_steps = VALUES(recommended_next_steps),
        confidence_level = VALUES(confidence_level),
        disclaimer = VALUES(disclaimer),
        raw_ai_response = VALUES(raw_ai_response),
        ai_model = VALUES(ai_model),
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      caseId,
      result.neutralSummary,
      JSON.stringify(result.renterMainClaims || []),
      JSON.stringify(result.landlordMainClaims || []),
      JSON.stringify(
        result.imageEvidenceFindings || {
          renterEvidence: [],
          landlordEvidence: [],
          limitations: []
        }
      ),
      JSON.stringify(result.keyDisputedFacts || []),
      JSON.stringify(result.missingEvidence || []),
      result.suggestedResolution,
      JSON.stringify(result.recommendedNextSteps || []),
      result.confidenceLevel,
      result.disclaimer,
      JSON.stringify(result.rawAiResponse || null),
      result.aiModel || null
    ]
  );

  return dbResult.insertId;
}

module.exports = {
  getArbitrationResultByCaseId,
  mapArbitrationResultRow,
  upsertArbitrationResult
};
