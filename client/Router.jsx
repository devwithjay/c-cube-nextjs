import { Routes, Route, Navigate } from "react-router-dom";

import App from "./App.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminAssessment from "./pages/admin/AdminAssessment.jsx";
import AdminResults from "./pages/admin/AdminResults.jsx";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import GiveTest from "./pages/GiveTest.jsx";
export default function Router() {
  return (
    <Routes>
      {/* ================================
          ADMIN ROUTES
         ================================ */}

      <Route
        path="/admin"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

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
      {/* ================================
          PUBLIC C CUBE WEBSITE
         ================================ */}

      <Route
        path="/give-test"
        element={<GiveTest />}
      />

      <Route
        path="/"
        element={<App />}
      />

      <Route
        path="*"
        element={<App />}
      />
    </Routes>
  );
}