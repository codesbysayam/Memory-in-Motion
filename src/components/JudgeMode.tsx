import React from 'react';
import { SixtySecondAssessment } from './SixtySecondAssessment';

export interface JudgeModeProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreFullLab?: () => void;
  onEnterSandbox?: () => void;
  onNavigate?: (pageId: string) => void;
}

export const JudgeMode: React.FC<JudgeModeProps> = ({
  isOpen,
  onClose,
  onExploreFullLab,
  onEnterSandbox,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="sixty-second-test-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="60-Second Fast Verification Assessment"
    >
      <div className="w-full max-w-4xl my-auto">
        <SixtySecondAssessment
          isModal={true}
          onClose={onClose}
          onExploreFullLab={onExploreFullLab}
          onEnterSandbox={onEnterSandbox}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
};
