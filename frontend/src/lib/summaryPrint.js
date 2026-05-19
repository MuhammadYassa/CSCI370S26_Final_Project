import {
  formatCurrency,
  humanizeEnum,
  titleFromFilingPath
} from './format';

export function printDisputeSummary({ caseData, requirements }) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');

  if (!printWindow) {
    return;
  }

  const html = `
    <!doctype html>
    <html>
      <head>
        <title>Dispute Summary</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #172033; line-height: 1.5; }
          h1, h2 { margin-bottom: 8px; }
          .card { border: 1px solid #d3d7e3; border-radius: 16px; padding: 20px; margin-bottom: 20px; }
          .muted { color: #5f6880; }
        </style>
      </head>
      <body>
        <h1>Renter Dispute Summary</h1>
        <p class="muted">This printable summary is a frontend fallback for unsupported filing paths.</p>
        <div class="card">
          <h2>Case snapshot</h2>
          <p><strong>Case ID:</strong> ${caseData.caseId}</p>
          <p><strong>Status:</strong> ${humanizeEnum(caseData.status)}</p>
          <p><strong>Likely path:</strong> ${titleFromFilingPath(requirements.selectedFilingPath)}</p>
          <p><strong>Dispute type:</strong> ${humanizeEnum(caseData.disputeType)}</p>
          <p><strong>Amount requested:</strong> ${formatCurrency(caseData.amountRequested)}</p>
        </div>
        <div class="card">
          <h2>People and property</h2>
          <p><strong>Renter:</strong> ${caseData.renterFullName} (${caseData.renterEmail})</p>
          <p><strong>Landlord:</strong> ${caseData.landlordFullName} (${caseData.landlordEmail})</p>
          <p><strong>Property:</strong> ${caseData.propertyAddress}</p>
        </div>
        <div class="card">
          <h2>Dispute narrative</h2>
          <p>${caseData.disputeDescription || 'No description provided.'}</p>
        </div>
        <div class="card">
          <h2>Evidence notes</h2>
          <p>${caseData.evidenceDescription || 'No evidence description provided.'}</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
