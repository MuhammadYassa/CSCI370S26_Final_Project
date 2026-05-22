import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import AppShell from '../../components/AppShell';

import FormField from '../../components/FormField';
import StatusPill from '../../components/StatusPill';

import { api } from '../../lib/api';

import {
  coerceFieldValue,
  getBlueprintForPath
} from '../../lib/formFieldCatalog';

import {
  formatDateTime,
  titleFromFilingPath
} from '../../lib/format';

import { printDisputeSummary } from '../../lib/summaryPrint';

const REQUIRED_FIELDS = [
  'property_address',
  'city',
  'state',
  'zip_code',
  'landlord_name',
  'landlord_phone',
  'dispute_description'
];

export default function FormWorkflowPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);

        const response = await getCaseById(caseId);

        setCaseData(response);

        setFormData({
          property_address: response.property_address || '',
          city: response.city || '',
          state: response.state || '',
          zip_code: response.zip_code || '',
          lease_start_date: response.lease_start_date || '',
          monthly_rent: response.monthly_rent || '',
          landlord_name: response.landlord_name || '',
          landlord_phone: response.landlord_phone || '',
          landlord_address: response.landlord_address || '',
          repair_description: response.dispute_description || '',
          evidence_description: response.evidence_description || ''
        });
      } catch (err) {
        setError('Failed to load case.');
      } finally {
        setLoading(false);
      }
    }

    loadCase();
  }, [caseId]);

  const missingFields = useMemo(() => {
    const missing = [];

    if (!formData.landlord_address?.trim()) {
      missing.push('Landlord address');
    }

    if (!formData.repair_description?.trim()) {
      missing.push('Repair description');
    }

    return missing;
  }, [formData]);

  const canGeneratePdf = missingFields.length === 0;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await saveCaseFormAnswers(caseId, formData);

      alert('Answers saved successfully.');
    } catch (err) {
      alert('Failed to save answers.');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!canGeneratePdf) return;

    try {
      setGenerating(true);

      await generateOfficialPdf(caseId);

      alert('Official PDF generated successfully.');
    } catch (err) {
      alert('Failed to generate PDF.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <ErrorAlert message={error} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-stack">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Renter portal</p>

            <h1>Form review and download</h1>

            <p className="hero-copy">
              Review and complete your filing information before generating
              the final PDF.
            </p>
          </div>

          <div className="hero-actions">
            <div className="user-pill">
              <span className="role-badge">Renter</span>

              <strong>{caseData.renter_name}</strong>

              <span>{caseData.renter_email}</span>
            </div>

            <Link
              className="button button-secondary"
              to={`/cases/${caseId}`}
            >
              ← Back to case
            </Link>
          </div>
        </section>

        {missingFields.length > 0 && (
          <section className="card warning-card">
            <div className="info-row">
              <div className="info-icon warning-icon">⚠</div>

              <div>
                <h3>Missing fields</h3>

                <p>
                  Please complete the following required fields:
                </p>

                <div className="tag-list">
                  {missingFields.map((field) => (
                    <span key={field} className="tag">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="card info-card">
          <div className="info-row">
            <div className="info-icon">i</div>

            <div>
              <h3>Almost there</h3>

              <p>
                Complete the missing fields above to generate your official PDF.
              </p>
            </div>
          </div>
        </section>

        <div className="workflow-grid">
          <section className="card section-stack">
            <h2>Section 1 of 3: Case details</h2>

            <p className="section-copy">
              Information about the rental property and dispute.
            </p>

            <div className="form-grid">
              <label>
                <span>Property address</span>

                <input
                  name="property_address"
                  value={formData.property_address}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>City</span>

                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>State</span>

                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Zip code</span>

                <input
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Lease start date</span>

                <input
                  type="date"
                  name="lease_start_date"
                  value={formData.lease_start_date}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Monthly rent</span>

                <input
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Landlord full name</span>

                <input
                  name="landlord_name"
                  value={formData.landlord_name}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Landlord phone</span>

                <input
                  name="landlord_phone"
                  value={formData.landlord_phone}
                  onChange={handleChange}
                />
              </label>

              <label className="full-width">
                <span>Landlord address</span>

                <input
                  name="landlord_address"
                  value={formData.landlord_address}
                  onChange={handleChange}
                />
              </label>

              <label className="full-width">
                <span>Repair description</span>

                <textarea
                  rows="5"
                  name="repair_description"
                  value={formData.repair_description}
                  onChange={handleChange}
                />
              </label>

              <label className="full-width">
                <span>Evidence description</span>

                <textarea
                  rows="4"
                  name="evidence_description"
                  value={formData.evidence_description}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>

          <aside className="card progress-card">
            <h3>Your progress</h3>

            <div className="progress-bar">
              <div className="progress-fill" />
            </div>

            <p>33% complete</p>

            <ul className="progress-list">
              <li className="active-step">
                • Case details
              </li>

              <li>
                ○ Dispute details
              </li>

              <li>
                ○ Supporting details
              </li>
            </ul>
          </aside>
        </div>

        <section className="card section-stack">
          <div className="save-generate-row">
            <div>
              <h2>Save or generate</h2>

              <p className="section-copy">
                Save your answers anytime. When all required fields are complete,
                you can generate your official PDF.
              </p>
            </div>

            <div className="inline-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save answers'}
              </button>

              <button
                className="button"
                type="button"
                onClick={handleGeneratePdf}
                disabled={!canGeneratePdf || generating}
              >
                {generating
                  ? 'Generating...'
                  : 'Generate official PDF'}
              </button>
            </div>
          </div>

          {!canGeneratePdf && (
            <div className="info-banner">
              Complete all required fields to enable PDF generation.
            </div>
          )}

          <div className="inline-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() =>
                printDisputeSummary({
                  caseData,
                  formData
                })
              }
            >
              Print dispute summary
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}