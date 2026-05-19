import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import EvidenceSection from '../../components/EvidenceSection';
import StatusPill from '../../components/StatusPill';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  formatCurrency,
  formatDate,
  humanizeEnum
} from '../../lib/format';

function DetailRow({ label, value }) {
  return (
    <div className="detail-card">
      <strong>{label}</strong>
      <p className="muted">{value || 'Not provided'}</p>
    </div>
  );
}

function CaseDetailsPage() {
  const { caseId } = useParams();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCase() {
      try {
        const result = await api.getCase(caseId);

        if (!cancelled) {
          setCaseData(result);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCase();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  return (
    <AppShell
      actions={
        caseData ? (
          <div className="inline-actions">
            {user.role === 'RENTER' ? (
              <Link
                className="button"
                to={`/cases/${caseData.caseId}/form`}
              >
                Continue form workflow
              </Link>
            ) : null}
            <Link
              className="button button-secondary"
              to={`/cases/${caseData?.caseId}/landlord-response`}
            >
              Landlord response
            </Link>
            <Link
              className="button button-secondary"
              to={`/cases/${caseData?.caseId}/arbitration`}
            >
              Arbitration
            </Link>
          </div>
        ) : null
      }
      subtitle="Review the saved dispute information, supporting workflow status, and evidence area."
      title={caseData ? `Case #${caseData.caseId}` : 'Case details'}
    >
      {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

      {isLoading ? (
        <section className="card">
          <p className="empty-copy">Loading case details...</p>
        </section>
      ) : caseData ? (
        <>
          <section className="card section-stack">
            <div className="summary-head">
              <div>
                <p className="eyebrow">Current status</p>
                <h3>{humanizeEnum(caseData.disputeType)}</h3>
                <p className="section-copy">{caseData.propertyAddress}</p>
              </div>
              <StatusPill status={caseData.status} />
            </div>

            <div className="summary-grid">
              <div className="summary-tile">
                <strong>Amount requested</strong>
                <p className="muted">{formatCurrency(caseData.amountRequested)}</p>
              </div>
              <div className="summary-tile">
                <strong>Security deposit</strong>
                <p className="muted">{formatCurrency(caseData.securityDepositAmount)}</p>
              </div>
              <div className="summary-tile">
                <strong>Lease start</strong>
                <p className="muted">{formatDate(caseData.leaseStartDate)}</p>
              </div>
              <div className="summary-tile">
                <strong>Move-out date</strong>
                <p className="muted">{formatDate(caseData.moveOutDate)}</p>
              </div>
            </div>
          </section>

          <section className="detail-grid">
            <DetailRow
              label="Renter"
              value={`${caseData.renterFullName} • ${caseData.renterEmail}${caseData.renterPhone ? ` • ${caseData.renterPhone}` : ''}`}
            />
            <DetailRow
              label="Landlord"
              value={`${caseData.landlordFullName} • ${caseData.landlordEmail}${caseData.landlordPhone ? ` • ${caseData.landlordPhone}` : ''}`}
            />
            <DetailRow
              label="Property address"
              value={`${caseData.propertyAddress}${caseData.city ? `, ${caseData.city}` : ''}${caseData.state ? `, ${caseData.state}` : ''}${caseData.zipCode ? ` ${caseData.zipCode}` : ''}`}
            />
            <DetailRow
              label="Dispute description"
              value={caseData.disputeDescription}
            />
            <DetailRow
              label="Evidence description"
              value={caseData.evidenceDescription}
            />
          </section>

          <section className="case-grid">
            <article className="card section-stack">
              <p className="eyebrow">Form status</p>
              <h3>
                {caseData.generatedForm?.selectedFormName ||
                  'No generated official form yet'}
              </h3>
              <p className="section-copy">
                {caseData.generatedForm
                  ? caseData.generatedForm.reasonSelected
                  : 'Continue the form workflow to check requirements, answer missing questions, and generate a supported PDF.'}
              </p>
              {caseData.generatedForm?.generatedPdfUrl ? (
                <button
                  className="button"
                  onClick={() =>
                    api.downloadGeneratedForm(
                      caseData.generatedForm.generatedPdfUrl,
                      caseData.generatedForm.generatedPdfFilename
                    )
                  }
                  type="button"
                >
                  Download generated PDF
                </button>
              ) : null}
            </article>

            <article className="card section-stack">
              <p className="eyebrow">Landlord response</p>
              <h3>
                {caseData.landlordResponse
                  ? caseData.landlordResponse.landlordFullName
                  : 'Waiting for landlord response'}
              </h3>
              <p className="section-copy">
                {caseData.landlordResponse
                  ? caseData.landlordResponse.responseStatement
                  : 'The matching landlord account can open this case and submit its response here.'}
              </p>
            </article>

            <article className="card section-stack">
              <p className="eyebrow">Arbitration</p>
              <h3>
                {caseData.arbitrationResult
                  ? 'AI arbitration result saved'
                  : 'No arbitration result yet'}
              </h3>
              <p className="section-copy">
                {caseData.arbitrationResult
                  ? caseData.arbitrationResult.neutralSummary
                  : 'Once both sides have submitted information, the renter can request a neutral AI arbitration summary.'}
              </p>
            </article>
          </section>

          <EvidenceSection
            canUpload
            caseId={caseId}
            title="Case evidence"
          />
        </>
      ) : null}
    </AppShell>
  );
}

export default CaseDetailsPage;
