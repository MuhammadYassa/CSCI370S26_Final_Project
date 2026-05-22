import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NewCasePage from './pages/cases/NewCasePage';
import CaseDetailsPage from './pages/cases/CaseDetailsPage';
import FormWorkflowPage from './pages/cases/FormWorkflowPage';
import LandlordResponsePage from './pages/cases/LandlordResponsePage';
import ArbitrationPage from './pages/cases/ArbitrationPage';
import NotFoundPage from './pages/NotFoundPage';

function RootRedirect() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return (
      <div className="screen-center">
        <div className="loading-orb" />
        <p>Restoring your workspace...</p>
      </div>
    );
  }

  return (
    <Navigate
      replace
      to={isAuthenticated ? '/dashboard' : '/login'}
    />
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<RootRedirect />}
      />
      <Route
        path="/login"
        element={<LoginPage />}
      />
      <Route
        path="/register"
        element={<RegisterPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/new"
        element={
          <ProtectedRoute requireRole="RENTER">
            <NewCasePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:caseId"
        element={
          <ProtectedRoute>
            <CaseDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:caseId/form"
        element={
          <ProtectedRoute requireRole="RENTER">
            <FormWorkflowPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:caseId/landlord-response"
        element={
          <ProtectedRoute>
            <LandlordResponsePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:caseId/arbitration"
        element={
          <ProtectedRoute>
            <ArbitrationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

export default App;
