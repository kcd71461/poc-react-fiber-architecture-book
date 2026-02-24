import { useId, type ReactNode } from "react";

interface InlineAnnotationProps {
  term: string;
  children: ReactNode;
}

export function InlineAnnotation({ term, children }: InlineAnnotationProps) {
  const tooltipId = useId();

  return (
    <span className="rf-inline-note">
      <button
        type="button"
        className="rf-inline-note-trigger"
        aria-describedby={tooltipId}
        aria-label={`${term} 설명 열기`}
      >
        <span className="rf-inline-note-term">{term}</span>
        <sup className="rf-inline-note-mark">*</sup>
      </button>
      <span id={tooltipId} role="tooltip" className="rf-inline-note-popup">
        {children}
      </span>
    </span>
  );
}
