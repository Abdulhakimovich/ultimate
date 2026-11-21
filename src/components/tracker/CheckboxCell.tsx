'use client';

import Checkbox from '@/components/ui/Checkbox';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';

interface CheckboxCellProps {
  checked: boolean;
  onChange: () => void;
  isToday?: boolean;
  ariaLabel?: string;
}

export default function CheckboxCell({
  checked,
  onChange,
  isToday = false,
  ariaLabel,
}: CheckboxCellProps) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);
  const effectiveAriaLabel = ariaLabel || tr.tracker.checkHabit;

  return (
    <div
      className={`flex items-center justify-center p-0.5 rounded ${
        isToday ? 'bg-bg-selected/40' : ''
      }`}
    >
      <Checkbox
        checked={checked}
        onChange={() => onChange()}
        size="sm"
        ariaLabel={effectiveAriaLabel}
      />
    </div>
  );
}
