const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb, PDFName, PDFArray, PDFDict } = require('pdf-lib');
const { ServerError } = require('../utils/errors');
const { PDF_FIELD_MAPPINGS } = require('../config/pdfFieldMappings');
const { firstNonEmpty, formatCurrency } = require('../utils/formData');

const generatedFormsDirectory = path.resolve(__dirname, '..', '..', 'generated', 'forms');
fs.mkdirSync(generatedFormsDirectory, { recursive: true });

function wrapText(text, maxCharactersPerLine) {
  if (!text) {
    return [];
  }

  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxCharactersPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawWrappedText(page, text, x, y, options = {}) {
  const fontSize = options.fontSize || 10;
  const lineHeight = options.lineHeight || fontSize + 2;
  const maxWidth = options.maxWidth || 400;
  const maxCharactersPerLine = Math.max(20, Math.floor(maxWidth / (fontSize * 0.5)));
  const lines = wrapText(text, maxCharactersPerLine);
  const maxLines = options.maxLines || lines.length;
  const visibleLines = lines.slice(0, maxLines);

  if (lines.length > maxLines && visibleLines.length > 0) {
    const lastIndex = visibleLines.length - 1;
    visibleLines[lastIndex] = `${visibleLines[lastIndex].slice(0, Math.max(0, visibleLines[lastIndex].length - 3))}...`;
  }

  visibleLines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: y - (index * lineHeight),
      size: fontSize,
      color: rgb(0, 0, 0)
    });
  });
}

function drawCheckInBox(page, x, y, size = 12, options = {}) {
  const inset = options.inset || Math.max(3.5, size * 0.28);
  const thickness = options.thickness || 1.3;
  page.drawLine({
    start: { x: x + inset, y: y + inset },
    end: { x: x + size - inset, y: y + size - inset },
    thickness,
    color: rgb(0, 0, 0)
  });
  page.drawLine({
    start: { x: x + inset, y: y + size - inset },
    end: { x: x + size - inset, y: y + inset },
    thickness,
    color: rgb(0, 0, 0)
  });
}

function getContextValue(context, keys) {
  const values = keys.map((key) => context[key]);
  const resolved = firstNonEmpty(...values);
  if (resolved === null || resolved === undefined) {
    return null;
  }

  if (Array.isArray(resolved)) {
    return resolved.join(', ');
  }

  if (typeof resolved === 'boolean') {
    return resolved ? 'Yes' : 'No';
  }

  return String(resolved);
}

function sanitizeAcroFormFields(pdfDocument) {
  const acroForm = pdfDocument.catalog.lookup(PDFName.of('AcroForm'));
  if (!(acroForm instanceof PDFDict)) {
    return;
  }

  const fields = acroForm.lookup(PDFName.of('Fields'));
  if (!(fields instanceof PDFArray)) {
    return;
  }

  const validRefs = [];

  for (let index = 0; index < fields.size(); index += 1) {
    const ref = fields.get(index);
    const field = pdfDocument.context.lookup(ref);

    if (!(field instanceof PDFDict)) {
      continue;
    }

    const fieldType = field.lookup(PDFName.of('FT'));
    const fieldName = field.lookup(PDFName.of('T'));

    if (fieldType && fieldName) {
      validRefs.push(ref);
    }
  }

  acroForm.set(PDFName.of('Fields'), pdfDocument.context.obj(validRefs));
}

function fillAcroForm(pdfDocument, context, filingPath, embeddedFont) {
  const mapping = PDF_FIELD_MAPPINGS[filingPath];
  if (!mapping) {
    return;
  }

  if (mapping.sanitizeAcroForm) {
    sanitizeAcroFormFields(pdfDocument);
  }

  const form = pdfDocument.getForm();

  if (mapping.acroTextFields) {
    for (const [fieldName, keys] of Object.entries(mapping.acroTextFields)) {
      const value = getContextValue(context, keys);
      if (!value) {
        continue;
      }

      try {
        const field = form.getTextField(fieldName);
        field.setText(value.slice(0, 500));
      } catch (error) {
        continue;
      }
    }
  }

  if (mapping.acroCheckBoxes) {
    for (const [fieldName, keys] of Object.entries(mapping.acroCheckBoxes)) {
      const value = getContextValue(context, keys);
      const checked = String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'yes';
      try {
        const field = form.getCheckBox(fieldName);
        if (checked) {
          field.check();
        } else {
          field.uncheck();
        }
      } catch (error) {
        continue;
      }
    }
  }

  try {
    form.updateFieldAppearances(embeddedFont);
    form.flatten();
  } catch (error) {
    // If this template cannot be flattened cleanly, keep the filled appearance instead of failing generation.
  }
}

function applyOverlayFields(pdfDocument, context, filingPath) {
  const mapping = PDF_FIELD_MAPPINGS[filingPath];
  if (!mapping || !Array.isArray(mapping.overlayFields)) {
    return;
  }

  for (const overlayField of mapping.overlayFields) {
    const page = pdfDocument.getPage(overlayField.pageIndex);
    if (!page) {
      continue;
    }

    if (overlayField.type === 'checkbox') {
      const value = getContextValue(context, overlayField.keys);
      const checked = String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'yes';
      if (!checked) {
        continue;
      }

      drawCheckInBox(page, overlayField.x, overlayField.y, overlayField.size, {
        inset: overlayField.inset,
        thickness: overlayField.thickness
      });
      continue;
    }

    const value = getContextValue(context, overlayField.keys);
    if (!value) {
      continue;
    }

    drawWrappedText(page, value, overlayField.x, overlayField.y, {
      fontSize: overlayField.fontSize,
      lineHeight: overlayField.lineHeight,
      maxWidth: overlayField.maxWidth,
      maxLines: overlayField.maxLines
    });
  }
}

function appendSummaryPage(pdfDocument, context, route) {
  const page = pdfDocument.addPage([612, 792]);
  let cursorY = 748;

  page.drawText('Generated Filing Summary', {
    x: 50,
    y: cursorY,
    size: 18,
    color: rgb(0, 0, 0)
  });

  cursorY -= 30;

  const summaryLines = [
    `Case ID: ${context.caseId}`,
    `Selected Filing Path: ${route.filingPath}`,
    `Selected Form: ${route.formName || 'Unsupported form path'}`,
    `Filing Destination: ${route.filingDestination || 'N/A'}`,
    `Renter: ${context.renterFullName || 'N/A'}`,
    `Renter Email: ${context.renterEmail || 'N/A'}`,
    `Renter Phone: ${context.renterPhone || 'N/A'}`,
    `Landlord/Defendant: ${firstNonEmpty(context.defendantBusinessName, context.landlordFullName) || 'N/A'}`,
    `Landlord/Defendant Address: ${firstNonEmpty(context.respondentAddress, context.defendantAddress, context.landlordAddress, context.propertyAddress) || 'N/A'}`,
    `Property Address: ${context.propertyAddress || 'N/A'}`,
    `City/State/ZIP: ${context.cityStateZipLine || 'N/A'}`,
    `Dispute Type: ${context.disputeType || 'N/A'}`,
    `Security Deposit Issue Type: ${context.securityDepositIssueType || 'N/A'}`,
    `Amount Requested: ${formatCurrency(context.amountRequested) || 'N/A'}`,
    `Security Deposit Amount: ${formatCurrency(context.securityDepositAmount) || 'N/A'}`,
    `Date of Occurrence: ${context.dateOfOccurrence || context.moveOutDate || 'N/A'}`,
    `Move-In Date / Lease Start: ${context.moveInDate || context.leaseStartDate || 'N/A'}`
  ];

  for (const line of summaryLines) {
    drawWrappedText(page, line, 50, cursorY, { fontSize: 10, maxWidth: 510, lineHeight: 12 });
    cursorY -= 16;
  }

  cursorY -= 10;
  drawWrappedText(page, `Reason for Claim / Description: ${context.reasonForClaimWithDescription || context.disputeDescription || 'N/A'}`, 50, cursorY, {
    fontSize: 10,
    maxWidth: 510,
    lineHeight: 12
  });

  cursorY -= 72;
  drawWrappedText(page, `Repairs / Conditions: ${context.repairConditionsSummary || 'N/A'}`, 50, cursorY, {
    fontSize: 10,
    maxWidth: 510,
    lineHeight: 12
  });

  cursorY -= 72;
  const evidenceSummary = context.evidenceFiles.length > 0
    ? context.evidenceFiles
      .map((file) => `${file.originalFilename} - ${file.fileUrl}`)
      .join('; ')
    : context.evidenceDescription || 'No evidence files uploaded.';
  drawWrappedText(page, `Evidence Summary: ${evidenceSummary}`, 50, cursorY, {
    fontSize: 10,
    maxWidth: 510,
    lineHeight: 12
  });

  cursorY -= 96;
  drawWrappedText(
    page,
    'This generated PDF is for filing assistance only. It is not legal advice and is not an official court or government submission.',
    50,
    cursorY,
    {
      fontSize: 10,
      maxWidth: 510,
      lineHeight: 12
    }
  );
}

async function generatePdf(route, context) {
  if (!route.templatePath || !fs.existsSync(route.templatePath)) {
    throw new ServerError(`Required PDF template is missing for ${route.filingPath}.`);
  }

  const bytes = fs.readFileSync(route.templatePath);
  const pdfDocument = await PDFDocument.load(bytes);
  const embeddedFont = await pdfDocument.embedFont(StandardFonts.Helvetica);

  fillAcroForm(pdfDocument, context, route.filingPath, embeddedFont);
  applyOverlayFields(pdfDocument, context, route.filingPath);
  appendSummaryPage(pdfDocument, context, route);

  const fileName = `case-${context.caseId}-${route.generatedFileSlug}.pdf`;
  const relativePath = path.posix.join('generated', 'forms', fileName);
  const absolutePath = path.resolve(generatedFormsDirectory, fileName);

  const outputBytes = await pdfDocument.save();
  fs.writeFileSync(absolutePath, outputBytes);

  return {
    generatedPdfFilename: fileName,
    generatedPdfPath: relativePath
  };
}

module.exports = {
  generatePdf
};
