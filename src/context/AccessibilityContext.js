import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { logAccessibilityToggle } from "../api/learner";

const AccessibilityContext = createContext(null);

const DEFAULTS = {
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  focusMode: false,
  largeText: false,
};

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("snsi_a11y");
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // Apply classes to <html> element whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("font-dyslexia", settings.dyslexiaFont);
    root.classList.toggle("high-contrast", settings.highContrast);
    root.classList.toggle("reduced-motion", settings.reducedMotion);
    root.classList.toggle("focus-mode", settings.focusMode);
    root.classList.toggle("text-lg", settings.largeText);
    localStorage.setItem("snsi_a11y", JSON.stringify(settings));
  }, [settings]);

  const toggle = useCallback((feature) => {
    setSettings((prev) => {
      const next = { ...prev, [feature]: !prev[feature] };
      // Fire-and-forget — log to backend for research
      logAccessibilityToggle(feature, next[feature]).catch(() => {});
      return next;
    });
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, toggle }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used inside AccessibilityProvider");
  return ctx;
}
