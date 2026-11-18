import React, { useState } from 'react';
import { Table, ChevronDown, ChevronUp } from 'lucide-react';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
}

type DataTableRow = Record<string, React.ReactNode> | React.ReactNode[];

interface DataFallbackTableProps {
  title?: string;
  caption?: string;
  columns?: DataTableColumn[];
  headers?: string[];
  rows: DataTableRow[];
  defaultOpen?: boolean;
  toggleLabel?: string;
}

export const DataFallbackTable: React.FC<DataFallbackTableProps> = ({
  title,
  caption,
  columns,
  headers,
  rows,
  defaultOpen = false,
  toggleLabel = 'Numeric data table',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const resolvedTitle = title || caption || toggleLabel;
  const resolvedColumns: DataTableColumn[] =
    columns ??
    (headers ?? []).map((h, i) => ({
      key: String(i),
      label: h,
      align: i === 0 ? 'left' : 'right',
    }));

  return (
    <div className="border-t border-[var(--mm-rule)] pt-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer py-1"
        aria-expanded={isOpen}
      >
        <Table className="w-3.5 h-3.5 text-[var(--mm-signal)]" />
        <span>
          {isOpen
            ? `Hide ${toggleLabel.toLowerCase()}`
            : `Inspect ${toggleLabel.toLowerCase()} (${rows.length} rows)`}
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-3 overflow-x-auto border-t border-b border-[var(--mm-rule)]">
          <table className="w-full text-left border-collapse text-xs tabular-nums">
            <caption className="sr-only">{resolvedTitle}</caption>
            <thead>
              <tr className="border-b border-[var(--mm-rule)] text-[var(--text-muted)] font-mono">
                {resolvedColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-2 px-3 font-semibold ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--mm-rule)]">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[var(--surface-soft)] transition-colors">
                  {resolvedColumns.map((col, colIdx) => {
                    const cellValue = Array.isArray(row) ? row[colIdx] : row[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`py-2 px-3 font-mono text-[var(--text-primary)] ${
                          col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
