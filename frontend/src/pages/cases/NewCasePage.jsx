import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import FormField from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { getRoutePreview } from '../../lib/routingPreview';

function buildNarrativeSuggestion(values) {
  const subject =
    values.disputeType === 'MAINTENANCE'
      ? 'apartment conditions and requested repairs'
      : values.disputeType === 'SECURITY_DEPOSIT'
        ? 'security deposit dispute'
        : 'rental dispute';

  const amountSentence = values.amountRequested
    ? `I am seeking ${Number(values.amountRequested).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })}.`
    : '';

  return [
    `I am filing a ${subject} case concerning ${values.propertyAddress || 'the rental property'}.`,
    values.landlordFullName
      ? `The landlord or management company is ${values.landlordFullName}.`
      : '',
    values.evidenceDescription
      ? `My current evidence includes ${values.evidenceDescription}.`
      : '',
    amountSentence
  ]
    .filter(Boolean)
    .join(' ');
}

function NewCasePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [values, setValues] = useState({
    renterFullName: user.fullName || '',
    renterEmail: user.email || '',
    renterPhone: '',
    landlordFullName: '',
    landlordEmail: '',
    landlordPhone: '',
    propertyAddress: '',
    city: '',
    state: 'NY',
    zipCode: '',
    disputeType: 'SECURITY_DEPOSIT',
    securityDepositAmount: '',
    amountRequested: '',
    leaseStartDate: '',
    leaseEndDate: '',
    moveOutDate: '',
    securityDepositIssueType: '',
    disputeDescription: '',
    evidenceDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const routePreview = useMemo(() => getRoutePreview(values), [values]);
  const suggestedNarrative = useMemo(
    () => buildNarrativeSuggestion(values),
    [values]
  );

  function updateField(fieldName, value) {
    setValues((current) => ({
      ...current,
      [fieldName]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setFormError('');
    setIsSubmitting(true);

    try {
      const result = await api.createCase({
        renterFullName: values.renterFullName,
        renterEmail: values.renterEmail,
        renterPhone: values.renterPhone,
        landlordFullName: values.landlordFullName,
        landlordEmail: values.landlordEmail,
        landlordPhone: values.landlordPhone,
        propertyAddress: values.propertyAddress,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        disputeType: values.disputeType,
        securityDepositAmount: values.securityDepositAmount,
        amountRequested: values.amountRequested,
        leaseStartDate: values.leaseStartDate,
        leaseEndDate: values.leaseEndDate,
        moveOutDate: values.moveOutDate,
        disputeDescription: values.disputeDescription,
        evidenceDescription: values.evidenceDescription
      });

      navigate(`/cases/${result.caseId}/form`);
    } catch (error) {
      setErrors(error.fields || {});
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell
      subtitle="This intake captures the core case record first, then routes you into the guided form questions for the supported filing path."
      title="Guided case intake"
    >
      <div className="form-layout">
        <section className="card section-stack">
          <div>
            <p className="eyebrow">Intake form</p>
            <h3>Start the case record</h3>
          </div>

          {formError ? <div className="alert alert-danger">{formError}</div> : null}

          <form
            className="stack-form"
            onSubmit={handleSubmit}
          >
            <div className="summary-grid">
              <FormField
                error={errors.renterFullName}
                fieldName="renterFullName"
                onChange={updateField}
                value={values.renterFullName}
              />
              <FormField
                error={errors.renterEmail}
                fieldName="renterEmail"
                onChange={updateField}
                value={values.renterEmail}
              />
              <FormField
                error={errors.renterPhone}
                fieldName="renterPhone"
                onChange={updateField}
                value={values.renterPhone}
              />
              <FormField
                error={errors.landlordFullName}
                fieldName="landlordFullName"
                onChange={updateField}
                value={values.landlordFullName}
              />
              <FormField
                error={errors.landlordEmail}
                fieldName="landlordEmail"
                onChange={updateField}
                value={values.landlordEmail}
              />
              <FormField
                error={errors.landlordPhone}
                fieldName="landlordPhone"
                onChange={updateField}
                value={values.landlordPhone}
              />
              <FormField
                error={errors.propertyAddress}
                fieldName="propertyAddress"
                onChange={updateField}
                value={values.propertyAddress}
              />
              <FormField
                error={errors.city}
                fieldName="city"
                onChange={updateField}
                value={values.city}
              />
              <FormField
                error={errors.state}
                fieldName="state"
                onChange={updateField}
                value={values.state}
              />
              <FormField
                error={errors.zipCode}
                fieldName="zipCode"
                onChange={updateField}
                value={values.zipCode}
              />

              <label className="field">
                <span>Dispute type</span>
                <select
                  onChange={(event) => updateField('disputeType', event.target.value)}
                  value={values.disputeType}
                >
                  <option value="SECURITY_DEPOSIT">Security deposit</option>
                  <option value="MAINTENANCE">Maintenance or repairs</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.disputeType ? <small>{errors.disputeType}</small> : null}
              </label>

              {values.disputeType === 'SECURITY_DEPOSIT' ? (
                <FormField
                  error={errors.securityDepositAmount}
                  fieldName="securityDepositAmount"
                  onChange={updateField}
                  value={values.securityDepositAmount}
                />
              ) : null}

              <FormField
                error={errors.amountRequested}
                fieldName="amountRequested"
                onChange={updateField}
                value={values.amountRequested}
              />

              {values.disputeType === 'SECURITY_DEPOSIT' ? (
                <FormField
                  error={errors.securityDepositIssueType}
                  fieldName="securityDepositIssueType"
                  onChange={updateField}
                  value={values.securityDepositIssueType}
                />
              ) : null}

              <FormField
                error={errors.leaseStartDate}
                fieldName="leaseStartDate"
                onChange={updateField}
                value={values.leaseStartDate}
              />
              <FormField
                error={errors.leaseEndDate}
                fieldName="leaseEndDate"
                onChange={updateField}
                value={values.leaseEndDate}
              />
              <FormField
                error={errors.moveOutDate}
                fieldName="moveOutDate"
                onChange={updateField}
                value={values.moveOutDate}
              />
            </div>

            <FormField
              error={errors.disputeDescription}
              fieldName="disputeDescription"
              onChange={updateField}
              value={values.disputeDescription}
            />
            <FormField
              error={errors.evidenceDescription}
              fieldName="evidenceDescription"
              onChange={updateField}
              value={values.evidenceDescription}
            />

            <button
              className="button"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Creating case...' : 'Create case and continue'}
            </button>
          </form>
        </section>

        <div className="sections-grid">
          <section className="card section-stack">
            <p className="eyebrow">Routing preview</p>
            <h3>{routePreview.title}</h3>
            <div
              className={`alert ${
                routePreview.status === 'supported'
                  ? 'alert-success'
                  : 'alert-warning'
              }`}
            >
              {routePreview.description}
            </div>
            <ul className="bullet-list">
              {routePreview.followUps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="card section-stack">
            <p className="eyebrow">Narrative drafting help</p>
            <h3>Suggested dispute summary</h3>
            <p className="section-copy">
              The current backend does not expose a separate renter-side AI
              drafting endpoint, so this page offers a structured draft you can
              edit before submission.
            </p>
            <div className="alert alert-info">{suggestedNarrative}</div>
            <button
              className="button button-secondary"
              onClick={() => updateField('disputeDescription', suggestedNarrative)}
              type="button"
            >
              Use this draft in the description field
            </button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

export default NewCasePage;
