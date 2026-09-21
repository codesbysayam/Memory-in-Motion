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
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 p-4 sm:p-5 rounded-2xl bg-white border border-[#DCD9CF] shadow-xl text-[#252525] font-sans animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EAF2FA] border border-[#CDE1F2] flex items-center justify-center shrink-0 text-[#1B4D7E]">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-[#1C1B19]">
              Privacy preferences
            </h4>
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className="text-[#888] hover:text-[#252525] p-1 cursor-pointer transition"
              aria-label="Close and reject optional tracking"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#55524B] leading-relaxed">
            This laboratory stores your experiment progress locally in your browser. We never harvest personal information. Would you like to enable anonymous analytics to help improve simulation accuracy?
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleChoice(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#1B4D7E] text-white text-xs font-semibold hover:bg-[#153E65] transition shadow-xs cursor-pointer"
            >
              Accept analytics
            </button>
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className="px-3.5 py-1.5 rounded-lg border border-[#D5D2C9] bg-[#FAF9F6] text-[#4B4840] text-xs font-medium hover:bg-[#F2EFE8] transition cursor-pointer"
            >
              Reject optional cookies
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
