import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PersonnelListPage from "./pages/PersonnelListPage";
import PersonnelDetailsPage from "./pages/PersonnelDetailsPage";
import MapViewPage from "./pages/MapViewPage";
import AppShell from "./components/layout/AppShell";
import { useAuth } from "./providers/AuthProvider";

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <div className="flex flex-col items-center gap-4 text-brand-dark">
          <span className="text-lg font-semibold">يتم التحميل...</span>
          <span className="h-1 w-32 overflow-hidden rounded-full bg-surface-card">
            <span className="block h-full animate-[pulse_1.2s_ease-in-out_infinite] bg-brand-light" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      <Route
        path="/"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="personnel" element={<PersonnelListPage />} />
        <Route path="personnel/:id" element={<PersonnelDetailsPage />} />
        <Route path="map" element={<MapViewPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const RequireAuth = ({
  children,
  isAuthenticated,
}: {
  children: ReactNode;
  isAuthenticated: boolean;
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default App;

