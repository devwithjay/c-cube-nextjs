import { Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAssessment from "./pages/admin/AdminAssessment";
import AdminResults from "./pages/admin/AdminResults";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminSettings from "./pages/admin/AdminSettings";
import GiveTest from "./pages/GiveTest";

export default function Router() {
  return (
    <Routes>
      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/tests/:testId"
        element={
          <ProtectedAdminRoute>
            <AdminAssessment />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/tests/:testId/results"
        element={
          <ProtectedAdminRoute>
            <AdminResults />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedAdminRoute>
            <AdminSettings />
          </ProtectedAdminRoute>
        }
      />

      {/* PUBLIC */}
      <Route path="/give-test" element={<GiveTest />} />
      <Route path="/" element={<App />} />
      <Route path="*" element={<App />} />
    </Routes>
  );
}
