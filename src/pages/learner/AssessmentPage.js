import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitAssessment } from "../../api/learner";
import Alert from "../../components/common/Alert";
import Spinner from "../../components/common/Spinner";

const STEPS = [
  {
    key: "formatPreference",
    question: "How do you prefer to receive information?",
    hint: "There is no right or wrong answer — this helps us personalise your lessons.",
    options: [
      { value: "VISUAL",   label: "Through diagrams and visuals",    icon: "🖼️" },
      { value: "TEXT",     label: "Through written explanations",     icon: "📝" },
      { value: "BALANCED", label: "A mix of both",                    icon: "⚖️" },
    ],
  },
  {
    key: "pacingTolerance",
    question: "How do you like to work through new content?",
    hint: "Think about what helps you learn without feeling rushed or bored.",
    options: [
      { value: "STEP_BY_STEP", label: "Step by step — one thing at a time", icon: "🐢" },
      { value: "MODERATE",     label: "At a steady pace",                    icon: "🚶" },
      { value: "FAST",         label: "Quickly — I pick things up fast",     icon: "⚡" },
    ],
  },
  {
    key: "supportSensitivity",
    question: "How much encouragement would you like?",
    hint: "This affects the tone and frequency of support messages during lessons.",
    options: [
      { value: "HIGH",   label: "Lots of encouragement and reassurance", icon: "💛" },
      { value: "MEDIUM", label: "Some encouragement",                    icon: "👍" },
      { value: "LOW",    label: "Neutral — just the content",            icon: "🎯" },
    ],
  },
  {
    key: "hintDependence",
    question: "How often do you usually use hints when you are stuck?",
    options: [
      { value: "HIGH",   label: "Frequently — hints really help me", icon: "🆘" },
      { value: "MEDIUM", label: "Sometimes",                         icon: "🤔" },
      { value: "LOW",    label: "Rarely — I prefer to figure it out", icon: "💪" },
    ],
  },
  {
    key: "focusSensitivity",
    question: "What kind of screen layout helps you focus best?",
    options: [
      { value: "MINIMAL_UI", label: "Minimal — less on screen is better", icon: "🔇" },
      { value: "STANDARD",   label: "Standard layout is fine for me",     icon: "🖥️" },
    ],
  },
  {
    key: "confidenceLevel",
    question: "How confident do you feel about learning new things right now?",
    hint: "Be honest — this helps us pitch the content at the right level.",
    options: [
      { value: "LOW",    label: "Not very confident",       icon: "😟" },
      { value: "MEDIUM", label: "Somewhat confident",       icon: "🙂" },
      { value: "HIGH",   label: "Very confident",           icon: "😄" },
    ],
  },
];

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const current = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
  };

  const handleNext = () => {
    if (!answers[current.key]) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await submitAssessment(answers);
      navigate("/learner/lessons");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save your profile. Please try again.");
      setLoading(false);
    }
  };

  const selected = answers[current.key];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-500 mb-1">Step {step + 1} of {STEPS.length}</p>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {current.question}
          </h2>
          {current.hint && (
            <p className="text-sm text-gray-500 mb-6">{current.hint}</p>
          )}

          <Alert type="error" message={error} className="mb-4" />

          <div className="space-y-3">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                  ${selected === opt.value
                    ? "border-brand-600 bg-brand-50"
                    : "border-gray-200 hover:border-brand-300 bg-white"
                  }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className={`text-sm font-medium ${selected === opt.value ? "text-brand-700" : "text-gray-700"}`}>
                  {opt.label}
                </span>
                {selected === opt.value && (
                  <span className="ml-auto text-brand-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="btn-secondary"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!selected || loading}
              className="btn-primary min-w-[100px]"
            >
              {loading ? <Spinner size="sm" /> : step === STEPS.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
