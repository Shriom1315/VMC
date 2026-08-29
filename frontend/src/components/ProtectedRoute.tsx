import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, can, Permission, Role } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, user must have this permission to access the route */
  permission?: Permission;
  /** If set, user must have one of these roles */
  roles?: Role[];
  /** Where to redirect if not authenticated (default: /login) */
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  permission,
  roles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Not logged in → go to login, remember where they were trying to go
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Permission check
  if (permission && !can(user.role, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
