import { useAccessibility } from "../../context/AccessibilityContext";

const tools = [
  { key: "dyslexiaFont",  label: "Dyslexia font"  },
  { key: "highContrast",  label: "High contrast"  },
  { key: "focusMode",     label: "Focus mode"     },
  { key: "largeText",     label: "Large text"     },
  { key: "reducedMotion", label: "Reduce motion"  },
];

export default function AccessibilityToolbar() {
  const { settings, toggle } = useAccessibility();

  return (
    <div className="flex flex-wrap gap-2">
      {tools.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => toggle(key)}
          aria-pressed={settings[key]}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${settings[key]
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-brand-400"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
