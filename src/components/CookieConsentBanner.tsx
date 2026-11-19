import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export type Consent = {
  analytics: boolean;
  timestamp: string;
};

const CONSENT_STORAGE_KEY = 'memory_cookie_consent';

export function getCookieConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Consent;
    }
  } catch (err) {
    console.warn('Failed to parse cookie consent', err);
  }
  return null;
}

export function saveCookieConsent(analytics: boolean): Consent {
  const consent: Consent = {
    analytics,
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch (err) {
    console.warn('Failed to save cookie consent', err);
  }
  return consent;
}

export const CookieConsentBanner: React.FC = () => {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const stored = getCookieConsent();
    if (stored) {
      setConsent(stored);
      setIsVisible(false);
    } else {
      // Small delay before showing so it doesn't jarringly block the initial load
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (analytics: boolean) => {
    const saved = saveCookieConsent(analytics);
    setConsent(saved);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      id="cookie-consent-banner"
      role="region"
      aria-label="Privacy preferences"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-sm z-40 p-3.5 rounded-md bg-[var(--mm-paper-bright)] border border-[var(--mm-rule-strong)] shadow-[var(--shadow-popover)] text-[var(--text-primary)] font-sans animate-in slide-in-from-bottom-4 duration-300 no-print"
    >
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[var(--mm-signal)] shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-sans font-semibold text-xs text-[var(--text-primary)]">
              Local progress &amp; privacy
            </h4>
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 cursor-pointer transition-colors"
              aria-label="Close and reject optional tracking"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
            Experiments save locally in your browser. Enable anonymous usage analytics?
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleChoice(true)}
              className="btn-primary text-[11px] py-1 px-2.5 min-h-[28px]"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className="btn-secondary text-[11px] py-1 px-2.5 min-h-[28px]"
            >
              Reject optional
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
