'use client';

import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, Lightbulb, HelpCircle } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { instructionContent } from '@/lib/instruction-content';
import FAQAccordion from './FAQAccordion';
import TableOfContents from './TableOfContents';

export default function InstructionPage() {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);
  const content = instructionContent[language] || instructionContent.ru;

  return (
    <div className="max-w-[1200px] mx-auto py-4 sm:py-6 px-2 sm:px-4 space-y-8 pb-20">
      {/* 1. Hero Section */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 border-hairline text-center relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-32 blur-3xl opacity-25 rounded-full"
          style={{ background: 'var(--electric)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-md"
            style={{
              background: 'linear-gradient(135deg, var(--electric-glow), rgba(0, 212, 255, 0.2))',
              color: 'var(--electric)',
              border: '1px solid var(--border-bright)',
            }}
          >
            <BookOpen size={24} />
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {content.heroTitle}
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {content.heroSubtitle}
          </p>
        </div>
      </div>

      {/* 2. Mobile Table of Contents: Horizontally Scrollable Chips */}
      <div className="lg:hidden -mx-2 px-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 w-max">
          {content.sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {s.title}
            </a>
          ))}
          <a
            href="#tips"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            {content.tipsTitle}
          </a>
          <a
            href="#faq"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            {content.faqTitle}
          </a>
        </div>
      </div>

      {/* 3. Main Content Grid (Desktop Sticky Sidebar + Content Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
        {/* Desktop Sticky Sidebar */}
        <div className="hidden lg:block sticky top-20">
          <TableOfContents
            sections={content.sections}
            tipsTitle={content.tipsTitle}
            faqTitle={content.faqTitle}
            tocTitle={tr.instruction.toc}
          />
        </div>

        {/* Content Column */}
        <div className="space-y-6">
          {/* Main Sections (Quick Start, Tracker, Planner, Analytics, Profile) */}
          {content.sections.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="surface-card rounded-2xl p-5 sm:p-6 border-hairline space-y-4 scroll-mt-20"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--electric-glow)', color: 'var(--electric)' }}
                >
                  <Sparkles size={14} />
                </div>
                <h2 className="font-display font-bold text-base sm:text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {sec.title}
                </h2>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {sec.description}
              </p>

              {sec.steps && sec.steps.length > 0 && (
                <div className="space-y-2 pt-1">
                  {sec.steps.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border-hairline"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5"
                        style={{
                          background: 'var(--electric-glow)',
                          color: 'var(--electric)',
                          border: '1px solid var(--border-bright)',
                        }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {st}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Habit-Building Tips Section */}
          <section id="tips" className="surface-card rounded-2xl p-5 sm:p-6 border-hairline space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}
              >
                <Lightbulb size={14} />
              </div>
              <h2 className="font-display font-bold text-base sm:text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {content.tipsTitle}
              </h2>
            </div>

            <div className="space-y-2.5">
              {content.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-elevated)] border-hairline"
                >
                  <CheckCircle2 size={16} className="text-[var(--accent-green)] flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2.5 px-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--electric-glow)', color: 'var(--electric)' }}
              >
                <HelpCircle size={14} />
              </div>
              <h2 className="font-display font-bold text-base sm:text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {content.faqTitle}
              </h2>
            </div>

            <FAQAccordion items={content.faq} />
          </section>
        </div>
      </div>
    </div>
  );
}
