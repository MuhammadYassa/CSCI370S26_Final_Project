import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { humanizeEnum } from '../../lib/format';

function ArbitrationPage() {
  const { caseId } = useParams();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [arbitrationState, setArbitrationState] = useState(null);
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  async function loadPage() {
    setIsLoading(true);

    try {
      const [caseResult, arbitrationResult] = await Promise.all([
        api.getCase(caseId),
        api.getArbitration(caseId)
      ]);

      setCaseData(caseResult);
      setArbitrationState(arbitrationResult);
    } catch (error) {
      setBanner({
        type: 'danger',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, [caseId]);

  async function handleGenerate() {
    setIsGenerating(true);
    setBanner(null);

    try {
      const result = await api.generateArbitration(caseId);
      setArbitrationState(result);

      if (result.status === 'ARBITRATION_NOT_READY') {
        setBanner({
          type: 'warning',
          message: result.message
        });
      } else {
        await loadPage();
        setBanner({
          type: 'success',
          message: 'AI arbitration generated successfully.'
        });
      }
    } catch (error) {
      setBanner({
        type: 'danger',
        message: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const result = arbitrationState?.arbitrationResult || caseData?.arbitrationResult;
  const canGenerate = user.role === 'RENTER';

  return (
    <AppShell
      actions={
        canGenerate ? (
          <button
            className="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            type="button"
          >
            {isGenerating ? 'Generating...' : 'Generate arbitration'}
          </button>
        ) : null
      }
      subtitle="AI arbitration is informational only, never legal advice or a binding official decision."
      title="Arbitration result"
    >
      {banner ? <div className={`alert alert-${banner.type}`}>{banner.message}</div> : null}

      {isLoading ? (
        <section className="card">
          <p className="empty-copy">Loading arbitration data...</p>
        </section>
      ) : caseData ? (
        <>
          <section className="card section-stack">
            <p className="eyebrow">Readiness check</p>
            <h3>{caseData.propertyAddress}</h3>
            <div className="summary-grid">
              <div className="summary-tile">
                <strong>Case status</strong>
                <p className="muted">{humanizeEnum(caseData.status)}</p>
              </div>
              <div className="summary-tile">
                <strong>Landlord response</strong>
                <p className="muted">
                  {caseData.landlordResponse ? 'Present' : 'Missing'}
                </p>
              </div>
              <div className="summary-tile">
                <strong>Arbitration availability</strong>
                <p className="muted">
                  {caseData.landlordResponse
                    ? 'Ready to request'
                    : 'Blocked until landlord response exists'}
                </p>
              </div>
            </div>

            {!caseData.landlordResponse ? (
              <div className="alert alert-warning">
                A landlord response is required before the backend will generate arbitration.
              </div>
            ) : null}
          </section>

          {result ? (
            <>
              <section className="card section-stack">
                <p className="eyebrow">Neutral summary</p>
                <h3>Balanced overview of both sides</h3>
                <div className="alert alert-info">{result.neutralSummary}</div>
              </section>

              <section className="case-grid">
                <article className="card section-stack">
                  <h3>Renter main claims</h3>
                  <ul className="bullet-list">
                    {result.renterMainClaims.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="card section-stack">
                  <h3>Landlord main claims</h3>
                  <ul className="bullet-list">
                    {result.landlordMainClaims.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </section>

              <section className="case-grid">
                <article className="card section-stack">
                  <h3>Key disputed facts</h3>
                  <ul className="bullet-list">
                    {result.keyDisputedFacts.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="card section-stack">
                  <h3>Missing evidence</h3>
                  <ul className="bullet-list">
                    {result.missingEvidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </section>

              <section className="card section-stack">
                <h3>Image evidence findings</h3>
                <div className="summary-grid">
                  <div className="summary-tile">
                    <strong>Renter-side images</strong>
                    <ul className="bullet-list">
                      {result.imageEvidenceFindings.renterEvidence.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="summary-tile">
                    <strong>Landlord-side images</strong>
                    <ul className="bullet-list">
                      {result.imageEvidenceFindings.landlordEvidence.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="summary-tile">
                    <strong>Attachment limitations</strong>
                    <ul className="bullet-list">
                      {result.imageEvidenceFindings.limitations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="case-grid">
                <article className="card section-stack">
                  <h3>Suggested resolution</h3>
                  <p className="muted">{result.suggestedResolution}</p>
                </article>

                <article className="card section-stack">
                  <h3>Recommended next steps</h3>
                  <ul className="bullet-list">
                    {result.recommendedNextSteps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </section>

              <section className="card section-stack">
                <div className="summary-grid">
                  <div className="summary-tile">
                    <strong>Confidence level</strong>
                    <p className="muted">{humanizeEnum(result.confidenceLevel)}</p>
                  </div>
                  <div className="summary-tile">
                    <strong>Disclaimer</strong>
                    <p className="muted">{result.disclaimer}</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="card section-stack">
              <p className="eyebrow">No result yet</p>
              <h3>Arbitration has not been generated</h3>
              <p className="section-copy">
                {canGenerate
                  ? 'Once the landlord response is present, use the button above to request the AI summary. If the provider is unavailable, this page will preserve the case and let you retry.'
                  : 'The renter typically triggers arbitration after both sides have submitted information.'}
              </p>
            </section>
          )}
        </>
      ) : null}
    </AppShell>
  );
}

export default ArbitrationPage;
