const { getPool } = require('../config/db');
const { validateFormAnswersInput } = require('../utils/validation');

function parseAnswersRow(row) {
  if (!row) {
    return {};
  }

  if (typeof row.answers === 'string') {
    return JSON.parse(row.answers);
  }

  return row.answers || {};
}

async function getFormAnswersByCaseId(caseId) {
  const [rows] = await getPool().execute(
    `
      SELECT answers
      FROM case_form_answers
      WHERE case_id = ?
      LIMIT 1
    `,
    [caseId]
  );

  return parseAnswersRow(rows[0]);
}

async function saveFormAnswers(caseId, payload) {
  const input = validateFormAnswersInput(payload);
  const existingAnswers = await getFormAnswersByCaseId(caseId);
  const mergedAnswers = {
    ...existingAnswers,
    ...input.answers
  };

  await getPool().execute(
    `
      INSERT INTO case_form_answers (case_id, answers)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        answers = VALUES(answers),
        updated_at = CURRENT_TIMESTAMP
    `,
    [caseId, JSON.stringify(mergedAnswers)]
  );

  return mergedAnswers;
}

module.exports = {
  getFormAnswersByCaseId,
  saveFormAnswers
};
