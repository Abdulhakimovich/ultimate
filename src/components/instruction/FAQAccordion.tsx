'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FAQItem } from '@/lib/instruction-content';

interface Props {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div
      className="surface-card rounded-2xl overflow-hidden divide-y"
      style={{
        borderColor: 'var(--border)',
        border: '1px solid var(--border)',
      }}
    >
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `faq-btn-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div key={index} className="transition-colors">
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(index);
                }
              }}
              className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--electric)]"
              style={{
                color: 'var(--text-primary)',
                background: isOpen ? 'var(--bg-elevated)' : 'transparent',
              }}
            >
              <span>{item.question}</span>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-transform duration-200"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  background: isOpen ? 'var(--electric-glow)' : 'var(--bg-elevated)',
                  color: isOpen ? 'var(--electric)' : 'var(--text-muted)',
                }}
              >
                <ChevronDown size={14} />
              </div>
            </button>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm leading-relaxed"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-elevated)',
                }}
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
