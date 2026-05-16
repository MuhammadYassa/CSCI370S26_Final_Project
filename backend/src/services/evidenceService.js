const fs = require('fs/promises');
const path = require('path');
const { getPool } = require('../config/db');
const caseService = require('./caseService');
const { NotFoundError, ValidationError } = require('../utils/errors');

const backendRoot = path.resolve(__dirname, '..', '..');

function mapEvidenceRow(row, baseUrl) {
  return {
    evidenceId: row.id,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    createdAt: row.created_at,
    fileUrl: `${baseUrl}/api/evidence/${row.id}/file`
  };
}

function buildEvidenceReference(row) {
  const absolutePath = path.resolve(backendRoot, row.storage_path);

  return {
    evidenceId: row.id,
    caseId: row.case_id,
    originalFilename: row.original_filename,
    storedFilename: row.stored_filename,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    storagePath: row.storage_path,
    absolutePath,
    createdAt: row.created_at
  };
}

async function cleanupFiles(files) {
  await Promise.all(
    (files || []).map((file) => fs.unlink(file.path).catch(() => undefined))
  );
}

function fileMatchesMimeType(signature, mimeType) {
  if (mimeType === 'image/jpeg') {
    return signature.length >= 3 &&
      signature[0] === 0xff &&
      signature[1] === 0xd8 &&
      signature[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return pngSignature.every((byte, index) => signature[index] === byte);
  }

  if (mimeType === 'image/webp') {
    if (signature.length < 12) {
      return false;
    }

    const riffHeader = signature.subarray(0, 4).toString('ascii');
    const webpHeader = signature.subarray(8, 12).toString('ascii');
    return riffHeader === 'RIFF' && webpHeader === 'WEBP';
  }

  return false;
}

async function validateUploadedFiles(files) {
  for (const file of files) {
    const handle = await fs.open(file.path, 'r');

    try {
      const buffer = Buffer.alloc(12);
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
      const signature = buffer.subarray(0, bytesRead);

      if (!fileMatchesMimeType(signature, file.mimetype)) {
        throw new ValidationError('Please correct the highlighted fields.', {
          evidenceImages: 'Only valid JPEG, PNG, and WEBP image files are allowed.'
        });
      }
    } finally {
      await handle.close();
    }
  }
}

async function uploadEvidenceFiles(user, caseId, files, baseUrl) {
  if (!files || files.length === 0) {
    throw new ValidationError('Please correct the highlighted fields.', {
      evidenceImages: 'At least one evidence image is required.'
    });
  }

  const caseRow = await caseService.getAuthorizedCaseRow(user, caseId);
  try {
    await validateUploadedFiles(files);
  } catch (error) {
    await cleanupFiles(files);
    throw error;
  }

  const connection = await getPool().getConnection();

  const insertedIds = [];
  try {
    await connection.beginTransaction();

    for (const file of files) {
      const relativeStoragePath = path.posix.join('uploads', 'evidence', file.filename);
      const [result] = await connection.execute(
        `
          INSERT INTO evidence_files (
            case_id,
            uploaded_by_user_id,
            uploaded_by_role,
            original_filename,
            stored_filename,
            mime_type,
            file_size_bytes,
            storage_path
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          caseRow.id,
          user.id,
          user.role,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size,
          relativeStoragePath
        ]
      );

      insertedIds.push(result.insertId);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    await cleanupFiles(files);
    throw error;
  } finally {
    connection.release();
  }

  const placeholders = insertedIds.map(() => '?').join(', ');
  const [rows] = await getPool().execute(
    `
      SELECT id, original_filename, mime_type, file_size_bytes, created_at
      FROM evidence_files
      WHERE id IN (${placeholders})
      ORDER BY created_at ASC, id ASC
    `,
    insertedIds
  );

  return {
    evidence: rows.map((row) => mapEvidenceRow(row, baseUrl))
  };
}

async function getEvidenceForCase(user, caseId, baseUrl) {
  const caseRow = await caseService.getAuthorizedCaseRow(user, caseId);
  const pool = getPool();

  const [rows] = await pool.execute(
    `
      SELECT id, original_filename, mime_type, file_size_bytes, created_at
      FROM evidence_files
      WHERE case_id = ?
      ORDER BY created_at ASC, id ASC
    `,
    [caseRow.id]
  );

  return {
    evidence: rows.map((row) => mapEvidenceRow(row, baseUrl))
  };
}

async function getEvidenceReferencesForCase(caseId) {
  const numericCaseId = Number(caseId);
  if (!Number.isInteger(numericCaseId) || numericCaseId <= 0) {
    throw new NotFoundError('Case not found.');
  }

  const [rows] = await getPool().execute(
    `
      SELECT
        id,
        case_id,
        original_filename,
        stored_filename,
        mime_type,
        file_size_bytes,
        storage_path,
        created_at
      FROM evidence_files
      WHERE case_id = ?
      ORDER BY created_at ASC, id ASC
    `,
    [numericCaseId]
  );

  return rows.map(buildEvidenceReference);
}

async function getEvidenceFileForUser(user, evidenceId) {
  const numericEvidenceId = Number(evidenceId);
  if (!Number.isInteger(numericEvidenceId) || numericEvidenceId <= 0) {
    throw new NotFoundError('Evidence file not found.');
  }

  const pool = getPool();
  const [rows] = await pool.execute(
    `
      SELECT
        ef.id,
        ef.original_filename,
        ef.mime_type,
        ef.storage_path,
        c.id AS case_id,
        c.renter_user_id,
        c.landlord_email
      FROM evidence_files ef
      INNER JOIN cases c ON c.id = ef.case_id
      WHERE ef.id = ?
      LIMIT 1
    `,
    [numericEvidenceId]
  );

  const evidenceRow = rows[0];
  if (!evidenceRow) {
    throw new NotFoundError('Evidence file not found.');
  }

  await caseService.getAuthorizedCaseRow(user, evidenceRow.case_id);

  return {
    originalFilename: evidenceRow.original_filename,
    mimeType: evidenceRow.mime_type,
    absolutePath: path.resolve(backendRoot, evidenceRow.storage_path)
  };
}

module.exports = {
  uploadEvidenceFiles,
  getEvidenceForCase,
  getEvidenceFileForUser,
  getEvidenceReferencesForCase
};
