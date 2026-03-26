import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Auth
import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Learner
import AssessmentPage   from "./pages/learner/AssessmentPage";
import LessonsPage      from "./pages/learner/LessonsPage";
import LessonPlayerPage from "./pages/learner/LessonPlayerPage";

// Admin
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminExportsPage   from "./pages/admin/AdminExportsPage";

// Parent
import ParentProgressPage from "./pages/parent/ParentProgressPage";

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
       <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Learner */}
            <Route path="/learner/assessment" element={
              <ProtectedRoute allowedRoles={["LEARNER"]}>
                <AssessmentPage />
              </ProtectedRoute>
            } />
            <Route path="/learner/lessons" element={
              <ProtectedRoute allowedRoles={["LEARNER"]}>
                <LessonsPage />
              </ProtectedRoute>
            } />
            <Route path="/learner/lesson/:lessonId" element={
              <ProtectedRoute allowedRoles={["LEARNER"]}>
                <LessonPlayerPage />
              </ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/exports" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminExportsPage />
              </ProtectedRoute>
            } />

            {/* Parent */}
            <Route path="/parent/progress" element={
              <ProtectedRoute allowedRoles={["PARENT", "ADMIN"]}>
                <ParentProgressPage />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}
