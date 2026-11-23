'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePlannerStore } from '@/store/plannerStore';

interface DailyNotesProps {
  title: string;
  dateStr: string;
  field: 'notes' | 'improvements' | 'gratitude';
  values: string[];
}

export default function DailyNotes({ title, dateStr, field, values }: DailyNotesProps) {
  const [localValues, setLocalValues] = useState<string[]>(
    values.length >= 4 ? values : [...values, ...Array(4 - values.length).fill('')]
  );
  const updateEntry = usePlannerStore((s) => s.updateEntry);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const vals = values.length >= 4 ? values : [...values, ...Array(4 - values.length).fill('')];
    if (vals.some((v, idx) => v !== localValues[idx])) {
      setLocalValues(vals);
    }
  }, [values, localValues]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      const newValues = [...localValues];
      newValues[index] = value;
      setLocalValues(newValues);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateEntry(dateStr, field, newValues);
      }, 500);
    },
    [localValues, dateStr, field, updateEntry],
  );

  return (
    <div className="mt-1.5">
      <div
        className="text-xs font-mono font-semibold text-center mb-1 rounded py-0.5 tracking-wide bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]"
      >
        {title}
      </div>
      <div className="space-y-0.5">
        {localValues.slice(0, 4).map((val, i) => (
          <div key={i} className="flex items-center gap-1.5 px-1">
            <span className="text-xs font-mono w-3.5 shrink-0 text-[var(--text-muted)]">
              {i + 1}.
            </span>
            <input
              type="text"
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder="..."
              className="flex-1 text-xs bg-transparent border-b border-transparent hover:border-[var(--line-strong)] focus:border-[var(--electric)] text-[var(--text-primary)] outline-none py-0.5 placeholder:text-[var(--text-muted)] transition-colors"
              aria-label={`${title} (${i + 1})`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
