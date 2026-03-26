import { useEffect, useState } from "react";
import { getLearners, getAdaptationLogs } from "../../api/admin";
import { useApi } from "../../hooks/useApi";
import Navbar from "../../components/common/Navbar";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";
import Spinner from "../../components/common/Spinner";
import { formatSeconds } from "../../utils/downloadCsv";

export default function AdminDashboardPage() {
  const { data: learners, loading, error, execute } = useApi(getLearners);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [logs, setLogs]                   = useState([]);
  const [logsLoading, setLogsLoading]     = useState(false);
  const [logsError, setLogsError]         = useState("");

  useEffect(() => { execute(); }, [execute]);

  const handleViewLogs = async (userId) => {
    setSelectedUser(userId);
    setLogsLoading(true);
    setLogsError("");
    try {
      const res = await getAdaptationLogs(userId);
      setLogs(res.data);
    } catch {
      setLogsError("Failed to load adaptation logs.");
    } finally {
      setLogsLoading(false);
    }
  };

  if (loading) return <PageLoader message="Loading learner data…" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learner dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              {learners?.length ?? 0} pilot participant{learners?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <Alert type="error" message={error} className="mb-4" />

        {/* Learner table */}
        <div className="card overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Name", "Email", "Profile", "Completed", "Total time", "Retries", "Hints", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {learners?.map((learner) => (
                  <tr key={learner.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {learner.firstname} {learner.lastname}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{learner.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${learner.assessmentCompleted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {learner.assessmentCompleted ? "Done" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {learner.lessonsCompleted} / {learner.totalLessons}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatSeconds(learner.totalTimeOnTaskSeconds)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{learner.totalRetries}</td>
                    <td className="px-4 py-3 text-gray-700">{learner.totalHints}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewLogs(learner.userId)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Adaptations
                      </button>
                    </td>
                  </tr>
                ))}
                {learners?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No learners registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adaptation logs panel */}
        {selectedUser && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">
                Adaptation log — user {selectedUser}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Close ✕
              </button>
            </div>

            <Alert type="error" message={logsError} className="mb-3" />

            {logsLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No adaptations logged yet.</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge bg-purple-100 text-purple-700 text-xs">
                            {log.variantChosen}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.lessonTitle} — {log.blockType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 font-medium mb-1">
                          Rule: <span className="font-mono text-xs text-gray-600">{log.ruleTriggered}</span>
                        </p>
                        <p className="text-sm text-gray-600">{log.reason}</p>
                      </div>
                      <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                        <div>Retries: {log.retryCountAtDecision}</div>
                        <div>Time: {formatSeconds(log.timeOnTaskAtDecision)}</div>
                        <div className="mt-1">{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
