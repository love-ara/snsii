import Spinner from "./Spinner";

export default function PageLoader({ message = "Loading…" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
      <Spinner size="lg" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
