import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import StatusPill from '../../components/StatusPill';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  formatCurrency,
  formatDateTime,
  humanizeEnum
} from '../../lib/format';

function DashboardPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      try {
        const result = await api.getCases();

        if (!cancelled) {
          setCases(result.cases || []);
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

    loadCases();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: cases.length,
      formReady: cases.filter((item) => item.status === 'FORM_READY').length,
      awaitingArbitration: cases.filter((item) =>
        ['LANDLORD_RESPONSE_SUBMITTED', 'ARBITRATION_COMPLETE'].includes(item.status)
      ).length
    };
  }, [cases]);

  return (
    <AppShell
      actions={
        user.role === 'RENTER' ? (
          <Link
            className="button"
            to="/cases/new"
          >
            Create new case
          </Link>
        ) : null
      }
      subtitle={
        user.role === 'RENTER'
          ? 'Track intake, form generation, evidence, landlord participation, and arbitration from one place.'
          : 'Review the cases tied to your landlord email and respond from the matched case record.'
      }
      title={user.role === 'RENTER' ? 'Dashboard' : 'Assigned cases'}
    >
      <section className="stats-grid">
        <article className="stat-card">
          <p className="eyebrow">Total cases</p>
          <h3>{stats.total}</h3>
          <p className="section-copy">All cases visible to this signed-in account.</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Form ready</p>
          <h3>{stats.formReady}</h3>
          <p className="section-copy">Cases with a downloadable official form already generated.</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Later-stage workflow</p>
          <h3>{stats.awaitingArbitration}</h3>
          <p className="section-copy">Cases that already have a landlord response or arbitration result.</p>
        </article>
      </section>

      {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

      <section className="card section-stack">
        <div className="split-row">
          <div>
            <h3>{user.role === 'RENTER' ? 'Your cases' : 'Cases that match your email'}</h3>
            <p className="section-copy">
              {user.role === 'RENTER'
                ? 'Open a case to continue the guided form workflow, upload evidence, or request arbitration.'
                : 'Open a case to read the renter claim and submit or review the landlord response.'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="empty-copy">Loading cases...</p>
        ) : cases.length === 0 ? (
          <div className="alert alert-info">
            {user.role === 'RENTER'
              ? 'No cases yet. Start a new case to begin the intake and form workflow.'
              : 'No cases currently match this landlord account email.'}
          </div>
        ) : (
          <div className="case-grid">
            {cases.map((caseItem) => (
              <article
                key={caseItem.caseId}
                className="case-card"
              >
                <header>
                  <div>
                    <p className="eyebrow">Case #{caseItem.caseId}</p>
                    <h3>{caseItem.propertyAddress || 'Property address pending'}</h3>
                  </div>
                  <StatusPill status={caseItem.status} />
                </header>

                <div className="meta-row">
                  <span>{humanizeEnum(caseItem.disputeType)}</span>
                  <span>{formatCurrency(caseItem.amountRequested)}</span>
                  <span>{formatDateTime(caseItem.createdAt)}</span>
                </div>

                <div className="inline-actions">
                  <Link
                    className="button"
                    to={`/cases/${caseItem.caseId}`}
                  >
                    Open case
                  </Link>
                  {user.role === 'RENTER' ? (
                    <Link
                      className="button button-secondary"
                      to={`/cases/${caseItem.caseId}/form`}
                    >
                      Continue form
                    </Link>
                  ) : (
                    <Link
                      className="button button-secondary"
                      to={`/cases/${caseItem.caseId}/landlord-response`}
                    >
                      View response
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default DashboardPage;
