import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isReady, register } = useAuth();
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'RENTER'
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
      await register(values);
      navigate('/login', {
        replace: true,
        state: {
          email: values.email,
          registered: true
        }
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
          <p className="eyebrow">Create an account</p>
          <h1>Choose a renter or landlord role before you enter the case flow.</h1>
          <p>
            Renters can create and manage their own cases. Landlords can access
            cases only when their signed-in email matches the landlord email on
            the case.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Registration</p>
          <h1>Start with the right role</h1>
          <p className="hero-copy">
            Use the landlord email that already appears on the case if you plan
            to respond as the landlord.
          </p>

          {formError ? <div className="alert alert-danger">{formError}</div> : null}

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Full name</span>
              <input
                autoComplete="name"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    fullName: event.target.value
                  }))
                }
                type="text"
                value={values.fullName}
              />
              {errors.fullName ? <small>{errors.fullName}</small> : null}
            </label>

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
                autoComplete="new-password"
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

            <label className="field">
              <span>Role</span>
              <select
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    role: event.target.value
                  }))
                }
                value={values.role}
              >
                <option value="RENTER">Renter</option>
                <option value="LANDLORD">Landlord</option>
              </select>
              {errors.role ? <small>{errors.role}</small> : null}
            </label>

            <button
              className="button"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="hero-copy">
            Already registered?{' '}
            <Link
              className="link-text"
              to="/login"
            >
              Sign in
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;
