'use client';

import React from 'react';
import type { GuideSection } from '@/lib/instruction-content';

interface Props {
  sections: GuideSection[];
  tipsTitle: string;
  faqTitle: string;
  tocTitle: string;
}

export default function TableOfContents({ sections, tipsTitle, faqTitle, tocTitle }: Props) {
  return (
    <nav aria-label={tocTitle} className="surface-card rounded-2xl p-4 border-hairline space-y-3">
      <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
        {tocTitle}
      </span>

      <ul className="space-y-1 text-xs">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="block px-2.5 py-1.5 rounded-lg transition-colors truncate"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--electric)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {s.title}
            </a>
          </li>
        ))}

        <li>
          <a
            href="#tips"
            className="block px-2.5 py-1.5 rounded-lg transition-colors truncate"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--electric)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {tipsTitle}
          </a>
        </li>

        <li>
          <a
            href="#faq"
            className="block px-2.5 py-1.5 rounded-lg transition-colors truncate"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--electric)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {faqTitle}
          </a>
        </li>
      </ul>
    </nav>
  );
}
