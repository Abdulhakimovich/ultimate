'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToastStore, type ToastVariant, type ToastItem } from '@/stores/toastStore';

/* ------------------------------------------------------------------ */
/* Variant styling & icons                                            */
/* ------------------------------------------------------------------ */

const variantStyles: Record<
  ToastVariant,
  { bg: string; border: string; icon: React.ReactNode }
> = {
  success: {
    bg: 'bg-bg-card',
    border: 'border-accent-check',
    icon: <CheckCircle size={18} className="text-accent-check shrink-0" />,
  },
  error: {
    bg: 'bg-bg-card',
    border: 'border-accent-danger',
    icon: <AlertCircle size={18} className="text-accent-danger shrink-0" />,
  },
  info: {
    bg: 'bg-bg-card',
    border: 'border-accent-blue',
    icon: <Info size={18} className="text-accent-blue shrink-0" />,
  },
};

/* ------------------------------------------------------------------ */
/* Single Toast                                                       */
/* ------------------------------------------------------------------ */

function ToastCard({ toast }: { toast: ToastItem }) {
  const dismissToast = useToastStore((s) => s.dismissToast);
  const style = variantStyles[toast.variant];

  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      dismissToast(toast.id);
    }, toast.duration ?? 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismissToast]);

  const handleUndo = useCallback(() => {
    toast.onUndo?.();
    dismissToast(toast.id);
  }, [toast, dismissToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${style.bg} ${style.border}`}
      role="alert"
      aria-live="polite"
    >
      {style.icon}

      <p className="flex-1 text-sm text-text-primary">{toast.message}</p>

      {toast.onUndo && (
        <button
          type="button"
          onClick={handleUndo}
          className="shrink-0 rounded px-2 py-1 text-xs font-semibold text-accent-blue hover:bg-bg-card-alt transition-colors"
          aria-label="Отменить действие"
        >
          Отменить
        </button>
      )}

      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        className="shrink-0 rounded p-1 text-text-muted hover:text-text-primary hover:bg-bg-card-alt transition-colors"
        aria-label="Закрыть уведомление"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Toast Container (render once in layout)                            */
/* ------------------------------------------------------------------ */

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 w-full max-w-sm"
      aria-label="Уведомления"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
