import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import FormField from '../../components/FormField';
import { api } from '../../lib/api';
import {
  coerceFieldValue,
  getBlueprintForPath
} from '../../lib/formFieldCatalog';
import { formatDateTime } from '../../lib/format';

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
    () =>
      new Set(
        (requirements?.missingFields || []).map((item) => item.field)
      ),
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
        message: 'The official form was generated successfully.'
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
      subtitle="Review and complete your filing information before generating the final PDF."
      title="Form review and download"
    >
      {banner ? (
        <div className={`alert alert-${banner.type}`}>
          {banner.message}
        </div>
      ) : null}

      {isLoading ? (
        <section className="card">
          <p className="empty-copy">
            Loading form workflow...
          </p>
        </section>
      ) : caseData && requirements ? (
        <>
          {requirements.missingFields.length > 0 ? (
            <section className="card">
              <div className="alert alert-warning">
                Missing fields:{' '}
                {requirements.missingFields
                  .map((item) => item.label)
                  .join(', ')}
              </div>
            </section>
          ) : requirements.canGenerate ? (
            <section className="card">
              <div className="alert alert-success">
                All required information is complete.
                You can now generate the official PDF.
              </div>
            </section>
          ) : null}

          {blueprint.map((section) => (
            <section
              key={section.title}
              className="card section-stack"
            >
              <div>
                <p className="eyebrow">Guided questions</p>

                <h3>{section.title}</h3>

                <p className="section-copy">
                  {section.description}
                </p>
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
                  Save answers anytime or generate the
                  final PDF once all required fields
                  are complete.
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
                  disabled={
                    isGenerating || !requirements.canGenerate
                  }
                  onClick={handleGenerate}
                  type="button"
                >
                  {isGenerating
                    ? 'Generating...'
                    : 'Generate official PDF'}
                </button>
              </div>
            </div>

            {caseData.generatedForm?.createdAt ? (
              <div className="summary-panel">
                <strong>Last generated PDF</strong>

                <p className="muted">
                  {formatDateTime(
                    caseData.generatedForm.createdAt
                  )}
                </p>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </AppShell>
  );
}

export default FormWorkflowPage;