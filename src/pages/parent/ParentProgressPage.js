import { useState } from "react";
import { getLearnerProgress } from "../../api/parent";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";
import Alert from "../../components/common/Alert";
import { formatSeconds } from "../../utils/downloadCsv";

const statusStyles = {
  COMPLETED:   "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  NOT_STARTED: "bg-gray-100 text-gray-500",
};

export default function ParentProgressPage() {
  const [learnerEmail, setLearnerEmail] = useState("");
  const [progress, setProgress]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!learnerEmail.trim()) return;
    setLoading(true);
    setError("");
    setProgress(null);
    try {
      const res = await getLearnerProgress(learnerEmail.trim());
      setProgress(res.data);
    } catch (err) {
      setError(
        err.response?.status === 403
          ? "You do not have permission to view this learner's progress."
          : err.response?.data?.message || "Learner not found. Check the email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const completedCount = progress?.filter((p) => p.status === "COMPLETED").length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Learner progress</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your learner's email to view their lesson progress and activity.
          </p>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleSearch} className="card p-6 mb-6">
          <label className="label">Learner Email</label>
          <div className="flex gap-3">
            <input
              className="input"
              type="email"
              placeholder="e.g. precious@gmail.com"
              value={learnerEmail}
              onChange={(e) => setLearnerEmail(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
              {loading ? <Spinner size="sm" /> : "View progress"}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            You can find the learner email in the account confirmation email.
          </p>
        </form>

        <Alert type="error" message={error} className="mb-4" />

        {/* Results */}
        {progress && (
          <div>
            {/* Summary bar */}
            <div className="card p-5 mb-4 flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-600">{completedCount}</p>
                <p className="text-xs text-gray-500">Lessons completed</p>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">{progress.length}</p>
                <p className="text-xs text-gray-500">Total lessons</p>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all"
                    style={{ width: `${progress.length ? (completedCount / progress.length) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {progress.length ? Math.round((completedCount / progress.length) * 100) : 0}% complete
                </p>
              </div>
            </div>

            {/* Lesson cards */}
            <div className="space-y-3">
              {progress.map((item) => (
                <div key={item.lessonId} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.lessonTitle}</h3>
                    <span className={`badge ${statusStyles[item.status]}`}>
                      {item.status.replace("_", " ").toLowerCase()}
                    </span>
                  </div>

                  {item.status !== "NOT_STARTED" && (
                    <div className="flex gap-4 text-xs text-gray-500 mb-3">
                      <span>⏱ {formatSeconds(item.timeOnTaskSeconds)}</span>
                    </div>
                  )}

                  {item.encouragingSummary && (
                    <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
                      {item.encouragingSummary}
                    </div>
                  )}
                </div>
              ))}

              {progress.length === 0 && (
                <div className="card p-8 text-center text-gray-400 text-sm">
                  No lesson activity yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
