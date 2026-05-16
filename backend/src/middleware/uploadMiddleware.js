const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { ValidationError } = require('../utils/errors');

const evidenceDirectory = path.resolve(__dirname, '..', '..', 'uploads', 'evidence');
fs.mkdirSync(evidenceDirectory, { recursive: true });

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const mimeTypeToExtension = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, evidenceDirectory);
  },
  filename(req, file, cb) {
    const extension = mimeTypeToExtension[file.mimetype] || '';
    cb(null, `${crypto.randomUUID()}${extension}`);
  }
});

function fileFilter(req, file, cb) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(
      new ValidationError('Please correct the highlighted fields.', {
        evidenceImages: 'Only JPEG, PNG, and WEBP images are allowed.'
      })
    );
    return;
  }

  cb(null, true);
}

const evidenceUploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = {
  evidenceUploadMiddleware
};
