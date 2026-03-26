import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/common/Alert";
import Spinner from "../../components/common/Spinner";

const ROLES = ["LEARNER", "PARENT", "ADMIN"];

export default function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "LEARNER",
    parentEmail: "",
    gdprAcknowledged: false,
    consentGiven: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.gdprAcknowledged) {
      setError("You must acknowledge the data processing notice to register.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstname: form.firstname,
        lastname:  form.lastname,
        email:     form.email,
        password:  form.password,
        role:      form.role,
        gdprAcknowledged: form.gdprAcknowledged,
        consentGiven:     form.consentGiven,
        parentEmail: form.role === "LEARNER" && form.parentEmail ? form.parentEmail : null,
      };

      const res = await register(payload);
      const { token, role, userId, email } = res.data;
      signIn({ role, userId, email }, token);

      const redirects = { LEARNER: "/learner/lessons", PARENT: "/parent/progress", ADMIN: "/admin/dashboard" };
      navigate(redirects[role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-600 mb-1">SNSI</h1>
          <p className="text-sm text-gray-500">Create your account</p>
        </div>

        <div className="card p-8">
          <Alert type="error" message={error} className="mb-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First name</label>
                <input name="firstname" required className="input" value={form.firstname} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Last name</label>
                <input name="lastname" required className="input" value={form.lastname} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <input name="email" type="email" required className="input" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <label className="label">Password</label>
              <input name="password" type="password" required minLength={8} className="input" value={form.password} onChange={handleChange} />
            </div>

            <div>
              <label className="label">Role</label>
              <select name="role" className="input" value={form.role} onChange={handleChange}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {form.role === "LEARNER" && (
              <div>
                <label className="label">Parent email <span className="text-gray-400 font-normal">(optional)</span></label>
                <input name="parentEmail" type="email" className="input" value={form.parentEmail} onChange={handleChange} placeholder="parent@example.com" />
              </div>
            )}

            {/* GDPR notice */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs text-blue-800 space-y-2">
              <p className="font-semibold">Data processing notice</p>
              <p>
                SNSI collects interaction data including lesson activity, timing, and
                accessibility usage strictly for research purposes. Your data is stored
                securely, never sold, and you may request deletion at any time.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="gdprAcknowledged"
                checked={form.gdprAcknowledged}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-400"
              />
              <span className="text-sm text-gray-700">
                I have read and acknowledge the data processing notice <span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="consentGiven"
                checked={form.consentGiven}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-400"
              />
              <span className="text-sm text-gray-700">
                I consent to my interaction data being used for research purposes
              </span>
            </label>

            <button type="submit" disabled={loading || !form.gdprAcknowledged} className="btn-primary w-full mt-2">
              {loading ? <Spinner size="sm" /> : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
