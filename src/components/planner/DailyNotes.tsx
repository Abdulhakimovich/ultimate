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
    setLocalValues(vals);
  }, [values]);

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
    <div className="mt-2">
      <div
        className="text-[10px] font-semibold text-center mb-1 rounded py-0.5 tracking-wide"
        style={{
          background: 'var(--electric-glow)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        {title}
      </div>
      <div className="space-y-0.5">
        {localValues.slice(0, 4).map((val, i) => (
          <div key={i} className="flex items-center gap-1 px-1">
            <span className="text-[9px] font-mono w-3 shrink-0" style={{ color: 'var(--text-muted)' }}>
              {i + 1}.
            </span>
            <input
              type="text"
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder="..."
              className="flex-1 text-[10px] bg-transparent border-b border-transparent hover:border-[#3D5A7A] focus:border-[#00D4FF] text-text-primary outline-none py-0.5 placeholder:text-[#3D5A7A]"
              aria-label={`${title}, строка ${i + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
