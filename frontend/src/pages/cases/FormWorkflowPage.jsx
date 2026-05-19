import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

function buildBaseSource(caseData) {
  return {
    ...caseData,
    currentAddress: '',
    claimantAddress: '',
    claimantCity: caseData.city || '',
    claimantState: caseData.state || '',
    claimantZipCode: caseData.zipCode || '',
    landlordAddress: '',
    defendantBusinessName: caseData.landlordFullName || '',
    defendantAddress: '',
    defendantCity: caseData.city || '',
    defendantState: caseData.state || '',
    defendantZipCode: caseData.zipCode || '',
    respondentName: caseData.landlordFullName || '',
    respondentAddress: ''
  };
}

function getFieldNames(path) {
  return getBlueprintForPath(path).flatMap((section) => section.fields);
}

function buildInitialValues(caseData, currentAnswers, path) {
  const source = {
    ...buildBaseSource(caseData),
    ...(currentAnswers || {})
  };

  return getFieldNames(path).reduce((accumulator, fieldName) => {
    accumulator[fieldName] = coerceFieldValue(fieldName, source[fieldName]);
    return accumulator;
  }, {});
}

function FormWorkflowPage() {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [requirements, setRequirements] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const blueprint = useMemo(
    () => getBlueprintForPath(requirements?.selectedFilingPath),
    [requirements?.selectedFilingPath]
  );
  const missingFields = useMemo(
    () => new Set((requirements?.missingFields || []).map((item) => item.field)),
    [requirements?.missingFields]
  );

  async function loadWorkflow() {
    setIsLoading(true);

    try {
      const [caseResult, requirementsResult] = await Promise.all([
        api.getCase(caseId),
        api.getFormRequirements(caseId)
      ]);

      setCaseData(caseResult);
      setRequirements(requirementsResult);
      setFormValues(
        buildInitialValues(
          caseResult,
          requirementsResult.currentAnswers,
          requirementsResult.selectedFilingPath
        )
      );
      setErrors({});
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
    loadWorkflow();
  }, [caseId]);

  function handleFieldChange(fieldName, value) {
    setFormValues((current) => ({
      ...current,
      [fieldName]: value
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    setErrors({});
    setBanner(null);

    try {
      await api.saveFormAnswers(caseId, formValues);
      await loadWorkflow();
      setBanner({
        type: 'success',
        message: 'Form answers saved successfully.'
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

  async function handleGenerate() {
    setIsGenerating(true);
    setErrors({});
    setBanner(null);

    try {
      await api.generateForm(caseId);
      await loadWorkflow();
      setBanner({
        type: 'success',
        message: 'The official form was generated and is ready for download.'
      });
    } catch (error) {
      setErrors(error.fields || {});
      setBanner({
        type: 'danger',
        message: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <AppShell
      actions={
        caseData ? (
          <div className="inline-actions">
            <Link
              className="button button-secondary"
              to={`/cases/${caseData.caseId}`}
            >
              Back to case
            </Link>
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
                Download PDF
              </button>
            ) : null}
          </div>
        ) : null
      }
      subtitle="Check the selected filing path, answer the remaining guided questions, and generate the protected PDF only when the backend reports the case is ready."
      title="Form review and download"
    >
      {banner ? <div className={`alert alert-${banner.type}`}>{banner.message}</div> : null}

      {isLoading ? (
        <section className="card">
          <p className="empty-copy">Loading the form workflow...</p>
        </section>
      ) : caseData && requirements ? (
        <>
          <section className="card section-stack">
            <div className="summary-head">
              <div>
                <p className="eyebrow">Backend filing decision</p>
                <h3>{titleFromFilingPath(requirements.selectedFilingPath)}</h3>
                <p className="section-copy">{requirements.message}</p>
              </div>
              <StatusPill status={requirements.status} />
            </div>

            <div className="summary-grid">
              <div className="summary-tile">
                <strong>Selected form</strong>
                <p className="muted">{requirements.selectedFormName || 'No supported official form'}</p>
              </div>
              <div className="summary-tile">
                <strong>Filing destination</strong>
                <p className="muted">{requirements.filingDestination || 'Not available'}</p>
              </div>
              <div className="summary-tile">
                <strong>Official source</strong>
                {requirements.officialSourceUrl ? (
                  <a
                    className="link-text"
                    href={requirements.officialSourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open source form
                  </a>
                ) : (
                  <p className="muted">No source link for unsupported cases.</p>
                )}
              </div>
              <div className="summary-tile">
                <strong>Last generated PDF</strong>
                <p className="muted">
                  {caseData.generatedForm?.createdAt
                    ? formatDateTime(caseData.generatedForm.createdAt)
                    : 'Not generated yet'}
                </p>
              </div>
            </div>

            {requirements.reasonSelected ? (
              <div className="alert alert-info">{requirements.reasonSelected}</div>
            ) : null}

            {requirements.missingFields.length > 0 ? (
              <div className="alert alert-warning">
                Missing fields: {requirements.missingFields.map((item) => item.label).join(', ')}.
              </div>
            ) : requirements.canGenerate ? (
              <div className="alert alert-success">
                All required information is present. You can generate the official PDF now.
              </div>
            ) : null}
          </section>

          {requirements.selectedFilingPath === 'UNSUPPORTED_FORM_TYPE' ? (
            <section className="card section-stack">
              <p className="eyebrow">Unsupported-path fallback</p>
              <h3>Keep the dispute organized even without a supported form</h3>
              <p className="section-copy">
                The backend cannot generate an official filing document for this
                combination yet, but you can still keep the case saved and print
                a clean dispute summary for your records.
              </p>
              <div className="inline-actions">
                <button
                  className="button"
                  onClick={() =>
                    printDisputeSummary({
                      caseData,
                      requirements
                    })
                  }
                  type="button"
                >
                  Print dispute summary
                </button>
                <Link
                  className="button button-secondary"
                  to={`/cases/${caseId}`}
                >
                  Return to case details
                </Link>
              </div>
            </section>
          ) : (
            <>
              {blueprint.map((section) => (
                <section
                  key={section.title}
                  className="card section-stack"
                >
                  <div>
                    <p className="eyebrow">Guided questions</p>
                    <h3>{section.title}</h3>
                    <p className="section-copy">{section.description}</p>
                  </div>

                  <div className="summary-grid">
                    {section.fields.map((fieldName) => (
                      <FormField
                        key={fieldName}
                        error={errors[fieldName]}
                        fieldName={fieldName}
                        highlight={missingFields.has(fieldName)}
                        onChange={handleFieldChange}
                        value={formValues[fieldName]}
                      />
                    ))}
                  </div>
                </section>
              ))}

              <section className="card section-stack">
                <div className="split-row">
                  <div>
                    <h3>Save or generate</h3>
                    <p className="section-copy">
                      Save answers as you go. Generate only after every required
                      field is satisfied.
                    </p>
                  </div>

                  <div className="inline-actions">
                    <button
                      className="button button-secondary"
                      disabled={isSaving}
                      onClick={handleSave}
                      type="button"
                    >
                      {isSaving ? 'Saving...' : 'Save answers'}
                    </button>
                    <button
                      className="button"
                      disabled={isGenerating || !requirements.canGenerate}
                      onClick={handleGenerate}
                      type="button"
                    >
                      {isGenerating ? 'Generating...' : 'Generate official PDF'}
                    </button>
                  </div>
                </div>

                {requirements.filingInstructions?.length ? (
                  <div className="summary-panel">
                    <strong>Filing instructions</strong>
                    <ul className="bullet-list">
                      {requirements.filingInstructions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            </>
          )}
        </>
      ) : null}
    </AppShell>
  );
}

export default FormWorkflowPage;
