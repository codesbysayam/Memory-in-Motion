import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
  title?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '', title }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return (
    <span
      title={title}
      className={`katex-wrapper ${block ? 'block my-2 overflow-x-auto py-1 text-center' : 'inline-block align-baseline mx-0.5'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Automatically parses text containing $...$ or converts known recurrent memory equations
 * into beautifully formatted KaTeX elements.
 */
export const FormattedMathText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    // Standardize raw ascii equations into LaTeX
    let processed = text
      .replace(/M_\(t\+1\)\s*=\s*\\?lambda\s*M_t\s*\+\s*\\?eta\s*k_t\s*v_t\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k_t v_t^T$')
      .replace(/M_\(t\+1\)\s*=\s*λ\s*M_t\s*\+\s*η\s*k_t\s*v_t\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k_t v_t^T$')
      .replace(/M_\(t\+1\)\s*=\s*λ·M_t\s*\+\s*η·k_t·v_t\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k_t v_t^T$')
      .replace(/M_\(t\+1\)\s*=\s*λ\s*M_t\s*\+\s*η\s*k\s*v\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k v^T$')
      .replace(/M\(t\+1\)\s*=\s*λ\s*M\(t\)\s*\+\s*η\s*k\s*v\^T/g, '$M_{t+1} = \\lambda M_t + \\eta k v^T$')
      .replace(/S_\(t\+1\)\s*=\s*f\(S_t,\s*x_t\)/g, '$S_{t+1} = f(S_t, x_t)$')
      .replace(/σ_\(ij,\s*t\+1\)\s*=\s*λ\s*σ_ij\s*\+\s*η\s*x_i\s*y_j/g, '$\\sigma_{ij}(t+1) = \\lambda \\sigma_{ij}(t) + \\eta x_i y_j$')
      .replace(/σ_ij\(t\+1\)\s*=\s*λ\s*σ_ij\(t\)\s*\+\s*η\s*x_i\s*y_j/g, '$\\sigma_{ij}(t+1) = \\lambda \\sigma_{ij}(t) + \\eta x_i y_j$')
      .replace(/v̂\s*=\s*q\^T\s*M/g, '$\\hat{v} = q^T M$')
      .replace(/v̂\s*=\s*q\^T\s*·\s*M_t/g, '$\\hat{v} = q^T M_t$')
      .replace(/\\hat\{v\}\s*=\s*q\^T\s*M/g, '$\\hat{v} = q^T M$')
      .replace(/ΔM_t\s*=\s*M_t\s*-\s*M_\(t-1\)/g, '$\\Delta M_t = M_t - M_{t-1}$')
      .replace(/S_\{t\+1\}\s*=\s*\\lambda\s*S_t\s*\+\s*\\eta\s*\\cdot\s*\\text\{norm\}\(k_t\)\s*\\cdot\s*\\text\{norm\}\(v_t\)\^T/g, '$S_{t+1} = \\lambda S_t + \\eta \\cdot \\text{norm}(k_t) \\cdot \\text{norm}(v_t)^T$')
      .replace(/ℝ\^\(D\s*×\s*D\)/g, '$\\mathbb{R}^{D \\times D}$')
      .replace(/ℝ\^\(D×D\)/g, '$\\mathbb{R}^{D \\times D}$')
      .replace(/lambda\s*=\s*/g, '$\\lambda$ = ')
      .replace(/\\lambda\^t/g, '$\\lambda^t$')
      .replace(/λ\^t/g, '$\\lambda^t$')
      .replace(/lambda\s*<\s*1/g, '$\\lambda < 1$')
      .replace(/λ\s*<\s*1/g, '$\\lambda < 1$');

    // Split by $...$
    const tokens = processed.split(/(\$[^$]+\$)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('$') && token.endsWith('$') && token.length > 2) {
        const mathExpr = token.slice(1, -1);
        return <MathView key={idx} math={mathExpr} />;
      }
      return <React.Fragment key={idx}>{token}</React.Fragment>;
    });
  }, [text]);

  return <span className={className}>{parts}</span>;
};
