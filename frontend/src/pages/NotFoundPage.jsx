import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="screen-center">
      <div className="auth-card">
        <p className="eyebrow">Safe fallback</p>
        <h1>Page not found</h1>
        <p className="hero-copy">
          The page you requested does not exist or is no longer available.
        </p>
        <Link
          className="button"
          to="/"
        >
          Return to the app
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
