'use client';

import Checkbox from '@/components/ui/Checkbox';

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
  ariaLabel = 'Отметить привычку',
}: CheckboxCellProps) {
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
        ariaLabel={ariaLabel}
      />
    </div>
  );
}
