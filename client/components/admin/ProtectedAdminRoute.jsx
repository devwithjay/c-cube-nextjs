import { Navigate } from "react-router-dom";

import { getSavedAdminToken } from "../../services/adminApi";

export default function ProtectedAdminRoute({
  children
}) {
  const token = getSavedAdminToken();

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return children;
}