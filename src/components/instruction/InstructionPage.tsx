'use client';

import React from 'react';
import { BookOpen, Sparkles, Flame } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { instructionContent } from '@/lib/instruction-content';
import FAQAccordion from './FAQAccordion';

export default function InstructionPage() {
  const language = useLanguageStore((s) => s.language);
  const content = instructionContent[language] || instructionContent.en;

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-6 space-y-8 pb-20">
      {/* 1. Hero */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 border-hairline text-center relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-28 blur-3xl opacity-20 rounded-full"
          style={{ background: 'var(--electric)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-2.5 max-w-xl mx-auto">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto shadow-md"
            style={{
              background: 'linear-gradient(135deg, var(--electric-glow), rgba(0, 212, 255, 0.2))',
              color: 'var(--electric)',
              border: '1px solid var(--border-bright)',
            }}
          >
            <Sparkles size={20} />
          </div>

          <h1 className="font-display font-bold text-xl sm:text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {content.title}
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {content.intro}
          </p>
        </div>
      </div>

      {/* 2. Get started (4 numbered step cards) */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-base sm:text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {content.stepsTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {content.steps.map((step, idx) => (
            <div
              key={idx}
              className="surface-card rounded-2xl p-4 sm:p-5 border-hairline flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                  style={{
                    background: 'var(--electric-glow)',
                    color: 'var(--electric)',
                    border: '1px solid var(--border-bright)',
                  }}
                >
                  {idx + 1}
                </div>
                <h3 className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. The 4 rules (2x2 grid, 1 col mobile) + highlighted callout tip */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-base sm:text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {content.lawsTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {content.laws.map((law, idx) => (
            <div
              key={idx}
              className="surface-card rounded-2xl p-4 sm:p-5 border-hairline space-y-2"
            >
              <h3 className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {law.name}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {law.text}
              </p>
            </div>
          ))}
        </div>

        {/* Tip as highlighted callout */}
        <div
          className="rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm"
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: 'rgba(245, 158, 11, 0.18)',
              color: 'var(--accent-gold)',
            }}
          >
            <Flame size={16} className="animate-flame" />
          </div>
          <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {content.tip}
          </p>
        </div>
      </section>

      {/* 4. Book card (eyebrow, title, author, text, BookOpen icon, accent border, no link, no cover image) */}
      <section>
        <div
          className="surface-card rounded-2xl p-5 sm:p-6 shadow-md transition-all relative overflow-hidden"
          style={{
            border: '1px solid var(--border-bright)',
            borderLeft: '4px solid var(--electric)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <span
                className="text-xs sm:text-xs font-bold uppercase tracking-wider block"
                style={{ color: 'var(--electric)' }}
              >
                {content.book.eyebrow}
              </span>

              <h2 className="font-display font-bold text-lg sm:text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {content.book.title}
              </h2>

              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {content.book.author}
              </p>

              <p className="text-xs sm:text-sm leading-relaxed pt-1.5" style={{ color: 'var(--text-secondary)' }}>
                {content.book.text}
              </p>
            </div>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 self-start sm:self-center"
              style={{
                background: 'var(--electric-glow)',
                color: 'var(--electric)',
                border: '1px solid var(--border-bright)',
              }}
            >
              <BookOpen size={22} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ Accordion */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-base sm:text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {content.faqTitle}
        </h2>

        <FAQAccordion items={content.faq} />
      </section>
    </div>
  );
}
