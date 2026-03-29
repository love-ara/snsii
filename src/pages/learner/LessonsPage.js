import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLessons, getProfile } from "../../api/learner";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import AccessibilityToolbar from "../../components/common/AccessibilityToolbar";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";

const statusStyles = {
  COMPLETED:   "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  NOT_STARTED: "bg-gray-100 text-gray-500",
};

const statusLabels = {
  COMPLETED:   "Completed",
  IN_PROGRESS: "In progress",
  NOT_STARTED: "Not started",
};

export default function LessonsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: lessons, loading, error, execute } = useApi(getLessons);

  // useEffect(() => { execute(); }, [execute]);
    useEffect(() => {
    const init = async () => {
      try {
        await getProfile();
        await execute();
      } catch (err) {
        // No profile yet — send to assessment
        if (err.response?.status === 404 || err.response?.status === 409) {
          navigate("/learner/assessment");
          return;
        }
      }
      execute();
    };
    init();
      }, []);
  // }, [execute, navigate]);

  if (loading) return <PageLoader message="Loading your lessons…" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Pick up where you left off, or start a new lesson.
          </p>
        </div>

        {/* Accessibility controls */}
        <div className="card p-4 mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Accessibility settings
          </p>
          <AccessibilityToolbar />
        </div>

        <Alert type="error" message={error} className="mb-4" />

        {lessons?.length === 0 && (
          <div className="card p-8 text-center text-gray-400 text-sm">
            No lessons available yet. Check back soon.
          </div>
        )}

        <div className="space-y-3">
          {lessons?.map((lesson) => (
            <div key={lesson.id} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
                  {lesson.orderIndex ?? "—"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{lesson.title}</p>
                  {lesson.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{lesson.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`badge ${statusStyles[lesson.status]}`}>
                  {statusLabels[lesson.status]}
                </span>
                <button
                  onClick={() => navigate(`/learner/lesson/${lesson.id}`)}
                  className="btn-primary text-xs px-4 py-2"
                >
                  {lesson.status === "COMPLETED" ? "Review" : lesson.status === "IN_PROGRESS" ? "Continue" : "Start"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
