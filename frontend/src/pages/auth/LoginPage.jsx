import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isReady, login } = useAuth();
  const [values, setValues] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isReady && isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setFormError('');
    setIsSubmitting(true);

    try {
      await login(values);
      navigate(location.state?.from || '/dashboard', {
        replace: true
      });
    } catch (error) {
      setErrors(error.fields || {});
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-copy">
          <p className="eyebrow">Guided renter and landlord access</p>
          <h1>Return to your dispute workspace without losing the case trail.</h1>
          <p>
            Sign in to review saved cases, continue the official-form workflow,
            upload evidence, submit a landlord response, or retrieve an AI
            arbitration result.
          </p>

          <div className="feature-list">
            <article className="feature-card">
              <strong>Renter flow</strong>
              <p>Start a case, answer follow-up questions, and download supported forms.</p>
            </article>
            <article className="feature-card">
              <strong>Landlord flow</strong>
              <p>Open matched cases, review claim details, and save your response.</p>
            </article>
            <article className="feature-card">
              <strong>Arbitration flow</strong>
              <p>Generate a neutral summary only after both sides have submitted information.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Sign in</p>
          <h1>Welcome back</h1>
          <p className="hero-copy">
            {location.state?.registered
              ? 'Your account was created. Sign in to continue.'
              : 'Use the same email and password you registered with.'}
          </p>

          {formError ? <div className="alert alert-danger">{formError}</div> : null}

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    email: event.target.value
                  }))
                }
                type="email"
                value={values.email}
              />
              {errors.email ? <small>{errors.email}</small> : null}
            </label>

            <label className="field">
              <span>Password</span>
              <input
                autoComplete="current-password"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    password: event.target.value
                  }))
                }
                type="password"
                value={values.password}
              />
              {errors.password ? <small>{errors.password}</small> : null}
            </label>

            <button
              className="button"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="hero-copy">
            Need an account?{' '}
            <Link
              className="link-text"
              to="/register"
            >
              Create one here
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
