import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import EvidenceSection from '../../components/EvidenceSection';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatCurrency, formatDateTime } from '../../lib/format';

function LandlordResponsePage() {
  const { caseId } = useParams();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [values, setValues] = useState({
    landlordFullName: user.fullName || '',
    landlordEmail: user.email || '',
    responseStatement: '',
    amountLandlordClaims: '',
    evidenceDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        const [caseResult, responseResult] = await Promise.all([
          api.getCase(caseId),
          api.getLandlordResponse(caseId)
        ]);

        if (!cancelled) {
          setCaseData(caseResult);
          setResponseData(responseResult.landlordResponse);

          if (responseResult.landlordResponse) {
            setValues({
              landlordFullName: responseResult.landlordResponse.landlordFullName || user.fullName || '',
              landlordEmail: responseResult.landlordResponse.landlordEmail || user.email || '',
              responseStatement: responseResult.landlordResponse.responseStatement || '',
              amountLandlordClaims: responseResult.landlordResponse.amountLandlordClaims ?? '',
              evidenceDescription: responseResult.landlordResponse.evidenceDescription || ''
            });
          }
        }
      } catch (error) {
        if (!cancelled) {
          setBanner({
            type: 'danger',
            message: error.message
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [caseId, user.email, user.fullName]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrors({});
    setBanner(null);

    try {
      const result = await api.saveLandlordResponse(caseId, values);
      setResponseData(result.landlordResponse);
      setBanner({
        type: 'success',
        message: 'Landlord response saved successfully.'
      });
    } catch (error) {
      setErrors(error.fields || {});
      setBanner({
        type: 'danger',
        message: error.message
      });
    } finally {
      setIsSaving(false);
    }
  }

  const canEdit = user.role === 'LANDLORD';

  return (
    <AppShell
      subtitle="This page shows the renter claim summary and lets the matching landlord account submit or review a response."
      title="Landlord response"
    >
      {banner ? <div className={`alert alert-${banner.type}`}>{banner.message}</div> : null}

      {isLoading ? (
        <section className="card">
          <p className="empty-copy">Loading response workflow...</p>
        </section>
      ) : caseData ? (
        <>
          <section className="card section-stack">
            <p className="eyebrow">Claim summary</p>
            <h3>{caseData.propertyAddress}</h3>
            <p className="section-copy">{caseData.disputeDescription}</p>
            <div className="summary-grid">
              <div className="summary-tile">
                <strong>Renter</strong>
                <p className="muted">{caseData.renterFullName}</p>
              </div>
              <div className="summary-tile">
                <strong>Requested amount</strong>
                <p className="muted">{formatCurrency(caseData.amountRequested)}</p>
              </div>
              <div className="summary-tile">
                <strong>Evidence description</strong>
                <p className="muted">{caseData.evidenceDescription || 'Not provided'}</p>
              </div>
            </div>
          </section>

          <section className="card section-stack">
            <div>
              <p className="eyebrow">{canEdit ? 'Editable response' : 'Saved response'}</p>
              <h3>
                {responseData ? 'Landlord response on file' : 'No landlord response yet'}
              </h3>
              <p className="section-copy">
                {canEdit
                  ? 'The landlord email must match both the signed-in account and the case landlord email.'
                  : 'Renters can review the saved landlord response here after it is submitted.'}
              </p>
            </div>

            {responseData && !canEdit ? (
              <div className="summary-grid">
                <div className="summary-tile">
                  <strong>Landlord</strong>
                  <p className="muted">{responseData.landlordFullName}</p>
                </div>
                <div className="summary-tile">
                  <strong>Amount claimed</strong>
                  <p className="muted">{formatCurrency(responseData.amountLandlordClaims)}</p>
                </div>
                <div className="summary-tile">
                  <strong>Saved</strong>
                  <p className="muted">{formatDateTime(responseData.updatedAt)}</p>
                </div>
                <div className="summary-tile">
                  <strong>Evidence description</strong>
                  <p className="muted">{responseData.evidenceDescription || 'Not provided'}</p>
                </div>
                <div className="summary-tile">
                  <strong>Response statement</strong>
                  <p className="muted">{responseData.responseStatement}</p>
                </div>
              </div>
            ) : canEdit ? (
              <form
                className="stack-form"
                onSubmit={handleSubmit}
              >
                <div className="summary-grid">
                  <label className="field">
                    <span>Landlord full name</span>
                    <input
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          landlordFullName: event.target.value
                        }))
                      }
                      type="text"
                      value={values.landlordFullName}
                    />
                    {errors.landlordFullName ? <small>{errors.landlordFullName}</small> : null}
                  </label>

                  <label className="field">
                    <span>Landlord email</span>
                    <input
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          landlordEmail: event.target.value
                        }))
                      }
                      type="email"
                      value={values.landlordEmail}
                    />
                    {errors.landlordEmail ? <small>{errors.landlordEmail}</small> : null}
                  </label>

                  <label className="field">
                    <span>Amount landlord claims</span>
                    <input
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          amountLandlordClaims: event.target.value
                        }))
                      }
                      type="number"
                      value={values.amountLandlordClaims}
                    />
                    {errors.amountLandlordClaims ? <small>{errors.amountLandlordClaims}</small> : null}
                  </label>

                  <label className="field">
                    <span>Evidence description</span>
                    <input
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          evidenceDescription: event.target.value
                        }))
                      }
                      type="text"
                      value={values.evidenceDescription}
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Response statement</span>
                  <textarea
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        responseStatement: event.target.value
                      }))
                    }
                    rows={6}
                    value={values.responseStatement}
                  />
                  {errors.responseStatement ? <small>{errors.responseStatement}</small> : null}
                </label>

                <button
                  className="button"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? 'Saving response...' : 'Save landlord response'}
                </button>
              </form>
            ) : (
              <div className="alert alert-info">
                No landlord response has been submitted yet.
              </div>
            )}
          </section>

          <EvidenceSection
            canUpload={canEdit}
            caseId={caseId}
            subtitle={
              canEdit
                ? 'Upload landlord-side image evidence using the same protected route as the renter.'
                : 'Evidence uploaded to this case by either side appears here.'
            }
            title="Evidence attached to this case"
          />
        </>
      ) : null}
    </AppShell>
  );
}

export default LandlordResponsePage;
