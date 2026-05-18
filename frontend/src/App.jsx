import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";

import NewCase from "./pages/cases/NewCase";
import CaseDetails from "./pages/cases/CaseDetails";
import FormPage from "./pages/cases/FormPage";
import Arbitration from "./pages/cases/Arbitration";
import LandlordResponse from "./pages/cases/LandlordResponse";

import ErrorPage from "./pages/ErrorPage";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./routes/ProtectedRoute";

import LoadingPage from "./pages/LoadingPage";

function App() {
  return (
    <Routes>

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/new-case"
        element={
          <ProtectedRoute>
            <NewCase />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases/:caseId"
        element={
          <ProtectedRoute>
            <CaseDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases/:caseId/form"
        element={
          <ProtectedRoute>
            <FormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases/:caseId/arbitration"
        element={
          <ProtectedRoute>
            <Arbitration />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases/:caseId/landlord-response"
        element={
          <ProtectedRoute>
            <LandlordResponse />
          </ProtectedRoute>
        }
      />

      <Route
        path="/loading"
        element={<LoadingPage />}
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <ErrorPage
            title="404 Not Found"
            message="The page you requested does not exist."
          />
        }
      />

    </Routes>
  );
}

export default App;