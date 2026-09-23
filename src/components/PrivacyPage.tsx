import React from 'react';
import { Shield, ArrowLeft, CheckCircle2, Lock, EyeOff, Server, HardDrive, Mail } from 'lucide-react';

interface LegalPageProps {
  onBackToLab?: () => void;
}

export const PrivacyPage: React.FC<LegalPageProps> = ({ onBackToLab }) => {
  return (
    <div className="w-full bg-[#FFFFFF] min-h-[calc(100vh-60px)] font-sans text-[#252525]">
      {/* Top Banner Header */}
      <div className="border-b border-[#E6E2D8] bg-[#FAF8F5]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-4">
          <button
            type="button"
            onClick={onBackToLab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2EFE8] border border-[#D9D5CB] text-xs font-semibold text-[#4A4740] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research Lab</span>
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#184877]">
              <span className="px-2 py-0.5 rounded bg-[#EBF3FB] border border-[#BFDBF1] font-bold">
                LEGAL DISCLOSURE
              </span>
              <span>·</span>
              <span className="text-[#68655E]">MANDATORY TRANSPARENCY NOTICE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#191919] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-[#55524B] max-w-2xl leading-relaxed">
              Memory in Motion is committed to open scientific dissemination, privacy by default, and zero commercial tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Main Legal Content */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 space-y-8 leading-relaxed text-sm sm:text-base text-[#383530]">
        {/* Core Guarantee Callout */}
        <div className="p-5 rounded-2xl bg-[#F0F8F3] border border-[#C2E3CE] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1E5635]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Zero Data Harvesting & Local Deterministic Execution</span>
          </div>
          <p className="text-xs sm:text-sm text-[#1E5635] leading-relaxed">
            All matrix calculations, dynamic state history updates, and 60-second test assessments execute 100% locally in your browser sandbox. We do not transmit or monetize user interactions, prompts, or model readouts.
          </p>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#737068] font-bold block">
            Effective Date: March 2026 · Canonical Version 1.0
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#191919]">
            1. Information We Collect (And What We Do Not)
          </h2>
          <p>
            Memory in Motion does not require accounts, logins, credit cards, or personal identifiers. We do not maintain user profile databases or link IP addresses to browsing activity.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#191919]">
                <HardDrive className="w-4 h-4 text-[#184877]" />
                <span>Client-Side LocalStorage</span>
              </div>
              <p className="text-[#55524B] text-xs leading-relaxed">
                Saved milestone checkpoints, completed experiment states, and 60-second test scores remain strictly within your browser's private local storage. They never leave your device.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#191919]">
                <EyeOff className="w-4 h-4 text-[#1E6B43]" />
                <span>No Third-Party Advertising Trackers</span>
              </div>
              <p className="text-[#55524B] text-xs leading-relaxed">
                We do not integrate Google AdSense, Facebook Pixel, fingerprinting scripts, or cross-site tracking cookies.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#191919]">
            2. Infrastructure & Hosting
          </h2>
          <p>
            The web application is hosted on Google Cloud Run container infrastructure. When you request a page, basic standard HTTP request logs (such as timestamp, user agent header, and IP address) are processed transiently by edge network proxies to ensure uptime, TLS encryption, and DDoS mitigation in compliance with cloud security standards.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#191919]">
            3. Typography & External Fonts
          </h2>
          <p>
            This application loads open-source fonts (DM Sans, Newsreader, and JetBrains Mono) through Google Fonts, and mathematical rendering stylesheets via KaTeX CDN. Requests for these static assets follow standard web browser caching policies.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#191919]">
            4. User Rights & Data Deletion
          </h2>
          <p>
            Because all progress is stored locally in your browser's <code className="px-1.5 py-0.5 rounded bg-[#F2EFE8] font-mono text-xs text-[#201E1A]">localStorage</code>, you have complete control over your data. You can erase all test attempts, milestones, and saved preferences at any time by clearing your browser site data or using the in-app reset controls.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#191919]">
            5. Contact & Privacy Inquiries
          </h2>
          <p>
            If you have questions regarding this Privacy Policy or the scientific laboratory, you can reach the maintainers directly at:
          </p>
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#184877] shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong className="text-[#191919] block">Laboratory Administration & Technical Inquiries</strong>
              <a
                href="mailto:obsidianoptics.in@gmail.com"
                className="text-[#184877] hover:underline font-mono text-xs"
              >
                obsidianoptics.in@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <div className="pt-6 border-t border-[#E6E2D8] flex items-center justify-between">
          <span className="text-xs font-mono text-[#737068]">
            Memory in Motion · Scientific Laboratory
          </span>
          <button
            type="button"
            onClick={onBackToLab}
            className="px-5 py-2.5 rounded-xl bg-[#184877] hover:bg-[#133A60] text-white text-xs font-bold transition shadow cursor-pointer"
          >
            Return to Laboratory
          </button>
        </div>
      </div>
    </div>
  );
};
