import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startLesson, getBlock, completeLesson, abandonLesson } from "../../api/learner";
import Navbar from "../../components/common/Navbar";
import AccessibilityToolbar from "../../components/common/AccessibilityToolbar";
import Spinner from "../../components/common/Spinner";
import Alert from "../../components/common/Alert";

const BLOCK_SEQUENCE = ["CONCEPT", "EXPLANATION", "EXAMPLE", "PRACTICE", "REINFORCEMENT"];

export default function LessonPlayerPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("loading"); // loading | lesson | complete | error
  const [blockIndex, setBlockIndex] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [adaptationReason, setAdaptationReason] = useState("");
  const [showReason, setShowReason] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [error, setError] = useState("");

  // Session metrics — synced to backend on every block request
  const [retryCount, setRetryCount] = useState(0);
  const [hintCount, setHintCount]   = useState(0);
  const startTimeRef = useRef(Date.now());
  const getElapsed = () => Math.floor((Date.now() - startTimeRef.current) / 1000);

  // Start lesson on mount
  useEffect(() => {
    const init = async () => {
      try {
        await startLesson(Number(lessonId));
        await fetchBlock(0, 0, 0);
      } catch (err) {
        setError("Could not load lesson. Please try again.");
        setPhase("error");
      }
    };
    init();
    // eslint-disable-next-line
  }, [lessonId]);

  const fetchBlock = useCallback(async (index, retries, hints) => {
    setBlockLoading(true);
    setError("");
    try {
      const blockType = BLOCK_SEQUENCE[index];
      const res = await getBlock(
        Number(lessonId),
        blockType,
        retries,
        hints,
        getElapsed()
      );
      setCurrentBlock(res.data);
      setAdaptationReason(res.data.adaptationReason || "");
      setPhase("lesson");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load block.");
    } finally {
      setBlockLoading(false);
    }
  // eslint-disable-next-line
  }, [lessonId]);

  const handleNext = async () => {
    const nextIndex = blockIndex + 1;
    if (nextIndex >= BLOCK_SEQUENCE.length) {
      // All blocks done — complete
      try {
        await completeLesson(Number(lessonId), getElapsed());
        setPhase("complete");
      } catch {
        setError("Failed to save completion. Please try again.");
      }
    } else {
      setBlockIndex(nextIndex);
      await fetchBlock(nextIndex, retryCount, hintCount);
    }
  };

  const handleRetry = async () => {
    const newRetries = retryCount + 1;
    setRetryCount(newRetries);
    await fetchBlock(blockIndex, newRetries, hintCount);
  };

  const handleHint = async () => {
    const newHints = hintCount + 1;
    setHintCount(newHints);
    await fetchBlock(blockIndex, retryCount, newHints);
  };

  const handleAbandon = async () => {
    if (window.confirm("Are you sure you want to leave this lesson?")) {
      await abandonLesson(Number(lessonId)).catch(() => {});
      navigate("/learner/lessons");
    }
  };

  const progress = ((blockIndex) / BLOCK_SEQUENCE.length) * 100;

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="card p-10 text-center max-w-md w-full">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson complete!</h2>
            <p className="text-gray-500 text-sm mb-8">
              Great work finishing this lesson.
            </p>
            <button onClick={() => navigate("/learner/lessons")} className="btn-primary w-full">
              Back to lessons
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-brand-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        {/* Block header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="badge bg-brand-100 text-brand-700">
              {currentBlock?.blockType?.replace("_", " ")}
            </span>
            <span className="text-xs text-gray-400">
              {blockIndex + 1} / {BLOCK_SEQUENCE.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Retries: {retryCount}</span>
            <span className="text-xs text-gray-400 ml-2">Hints: {hintCount}</span>
            <button
              onClick={handleAbandon}
              className="ml-3 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Leave lesson
            </button>
          </div>
        </div>

        {/* Accessibility toolbar */}
        <div className="mb-6">
          <AccessibilityToolbar />
        </div>

        <Alert type="error" message={error} className="mb-4" />

        {/* Content block */}
        {blockLoading ? (
          <div className="card p-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : currentBlock ? (
          <div className="card p-8 mb-4">
            {/* Variant badge */}
            {currentBlock.variantType && currentBlock.variantType !== "DEFAULT" && (
              <span className="badge bg-purple-100 text-purple-700 mb-4 inline-block">
                {currentBlock.variantType.replace("_", " ").toLowerCase()}
              </span>
            )}

            {/* Content — rendered as HTML to support rich text from backend */}
            <div
              className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentBlock.content }}
            />
          </div>
        ) : null}

        {/* Adaptation reason — explainability panel */}
        {adaptationReason && (
          <div className="mb-4">
            <button
              onClick={() => setShowReason((v) => !v)}
              className="text-xs text-brand-600 hover:underline flex items-center gap-1"
            >
              {showReason ? "▾" : "▸"} Why was this content chosen for me?
            </button>
            {showReason && (
              <div className="mt-2 rounded-lg bg-brand-50 border border-brand-100 px-4 py-3 text-xs text-brand-800">
                {adaptationReason}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              disabled={blockLoading}
              className="btn-secondary text-xs"
            >
              Try again
            </button>
            <button
              onClick={handleHint}
              disabled={blockLoading}
              className="btn-secondary text-xs"
            >
              Hint
            </button>
          </div>
          <button
            onClick={handleNext}
            disabled={blockLoading}
            className="btn-primary min-w-[120px]"
          >
            {blockLoading ? <Spinner size="sm" /> : blockIndex === BLOCK_SEQUENCE.length - 1 ? "Finish lesson" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
