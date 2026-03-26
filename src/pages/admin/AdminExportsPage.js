import { useState } from "react";
import { exportEvents, exportProgress, exportAdaptations } from "../../api/admin";
import { downloadCsv } from "../../utils/downloadCsv";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";
import Alert from "../../components/common/Alert";

const EXPORTS = [
  {
    key: "events",
    label: "Behaviour events",
    description: "All logged learner events — logins, block views, retries, hints, accessibility toggles, and drop-offs.",
    filename: "snsi_pilot_events.csv",
    fn: exportEvents,
  },
  {
    key: "progress",
    label: "Lesson progress",
    description: "Per-learner lesson completion status, time on task, retry count, and hint count.",
    filename: "snsi_pilot_progress.csv",
    fn: exportProgress,
  },
  {
    key: "adaptations",
    label: "Adaptation decisions",
    description: "Every adaptation decision made by the engine — rule triggered, variant chosen, plain English reason, and learner profile snapshot.",
    filename: "snsi_pilot_adaptations.csv",
    fn: exportAdaptations,
  },
];

export default function AdminExportsPage() {
  const [loading, setLoading] = useState({});
  const [error, setError]     = useState("");

  const handleExport = async (item) => {
    setLoading((prev) => ({ ...prev, [item.key]: true }));
    setError("");
    try {
      const res = await item.fn();
      downloadCsv(res.data, item.filename);
    } catch {
      setError(`Failed to export ${item.label}. Please try again.`);
    } finally {
      setLoading((prev) => ({ ...prev, [item.key]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Research data exports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Download anonymised CSV datasets for pilot analysis.
            All exports exclude personally identifiable information.
          </p>
        </div>

        <Alert type="error" message={error} className="mb-6" />

        <div className="space-y-4">
          {EXPORTS.map((item) => (
            <div key={item.key} className="card p-6 flex items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                <p className="text-xs text-gray-400 mt-2 font-mono">{item.filename}</p>
              </div>
              <button
                onClick={() => handleExport(item)}
                disabled={loading[item.key]}
                className="btn-primary text-xs whitespace-nowrap min-w-[100px]"
              >
                {loading[item.key] ? <Spinner size="sm" /> : "Download CSV"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs text-blue-800">
          <p className="font-semibold mb-1">Data handling note</p>
          <p>
            Exports are anonymised at the point of generation. User IDs are
            included for cross-referencing datasets but no names, emails, or
            other personal data are present. Accounts flagged as deleted have
            their events anonymised — user_id will appear as "anon" in those rows.
          </p>
        </div>
      </div>
    </div>
  );
}
