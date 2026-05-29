import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("ADMIN" | "ENGINEER" | "VIEWER")[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-100 gap-4">
        {/* Sleek aesthetic loader with smooth animation */}
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute h-10 w-10 animate-ping rounded-full bg-primary/10"></div>
        </div>
        <p className="text-sm font-medium tracking-wide text-slate-400 animate-pulse">
          Loading workspace...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
