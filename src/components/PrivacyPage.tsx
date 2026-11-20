import React from 'react';
import { Shield, ArrowLeft, CheckCircle2, Lock, EyeOff, Server, HardDrive, Mail } from 'lucide-react';

interface LegalPageProps {
  onBackToLab?: () => void;
}

export const PrivacyPage: React.FC<LegalPageProps> = ({ onBackToLab }) => {
  return (
    <div className="w-full bg-[var(--page-bg)] min-h-[calc(100vh-60px)] font-sans text-[var(--text-primary)]">
      {/* Top Banner Header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-4">
          <button
            type="button"
            onClick={onBackToLab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--page-bg)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research Lab</span>
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[var(--color-accent-ink)] font-semibold">
                Legal disclosure
              </span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-[var(--text-muted)]">Mandatory transparency notice</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[var(--text-primary)] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Memory in Motion is committed to open scientific dissemination, privacy by default, and zero commercial tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Main Legal Content */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-10 space-y-8 leading-relaxed text-sm sm:text-base text-[var(--text-secondary)]">
        {/* Core Guarantee Callout */}
        <div className="p-5 rounded-xl bg-[var(--color-success-soft)] border border-[var(--color-success-border)] space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-success)]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Zero Data Harvesting &amp; Local Deterministic Execution</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-success)] leading-relaxed">
            All matrix calculations, dynamic state history updates, and 60-second test assessments execute 100% locally in your browser sandbox. We do not transmit or monetize user interactions, prompts, or model readouts.
          </p>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-mono text-[var(--text-muted)] font-medium block">
            Effective Date: March 2026 · Canonical Version 1.0
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            1. Information We Collect (And What We Do Not)
          </h2>
          <p>
            Memory in Motion does not require accounts, logins, credit cards, or personal identifiers. We do not maintain user profile databases or link IP addresses to browsing activity.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <HardDrive className="w-4 h-4 text-[var(--color-accent-ink)]" />
                <span>Client-Side LocalStorage</span>
              </div>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                Saved milestone checkpoints, completed experiment states, and 60-second test scores remain strictly within your browser's private local storage. They never leave your device.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <EyeOff className="w-4 h-4 text-[var(--color-success)]" />
                <span>No Third-Party Advertising Trackers</span>
              </div>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                We do not integrate Google AdSense, Facebook Pixel, fingerprinting scripts, or cross-site tracking cookies.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            2. Infrastructure &amp; Hosting
          </h2>
          <p>
            The web application is hosted on Google Cloud Run container infrastructure. When you request a page, basic standard HTTP request logs (such as timestamp, user agent header, and IP address) are processed transiently by edge network proxies to ensure uptime, TLS encryption, and DDoS mitigation in compliance with cloud security standards.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            3. Typography &amp; External Fonts
          </h2>
          <p>
            This application loads open-source fonts (Space Grotesk, DM Sans, and DM Mono) through Google Fonts, and mathematical rendering stylesheets via KaTeX CDN. Requests for these static assets follow standard web browser caching policies.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            4. User Rights &amp; Data Deletion
          </h2>
          <p>
            Because all progress is stored locally in your browser's <code className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] font-mono text-xs text-[var(--text-primary)]">localStorage</code>, you have complete control over your data. You can erase all test attempts, milestones, and saved preferences at any time by clearing your browser site data or using the in-app reset controls.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            5. Contact &amp; Privacy Inquiries
          </h2>
          <p>
            If you have questions regarding this Privacy Policy or the scientific laboratory, you can reach the maintainers directly at:
          </p>
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-3">
            <Mail className="w-5 h-5 text-[var(--color-accent-ink)] shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong className="text-[var(--text-primary)] block">Laboratory Administration &amp; Technical Inquiries</strong>
              <a
                href="mailto:obsidianoptics.in@gmail.com"
                className="text-[var(--color-accent-ink)] hover:underline font-mono text-xs"
              >
                obsidianoptics.in@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Memory in Motion · Scientific Laboratory
          </span>
          <button
            type="button"
            onClick={onBackToLab}
            className="px-5 py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--surface)] text-xs font-semibold transition cursor-pointer"
          >
            Return to Laboratory
          </button>
        </div>
      </div>
    </div>
  );
};
