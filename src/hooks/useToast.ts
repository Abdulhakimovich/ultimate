import { useCallback } from 'react';
import { useToastStore, type ToastVariant } from '@/stores/toastStore';

interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  onUndo?: () => void;
  duration?: number;
}

export function useToast() {
  const addToast = useToastStore((s) => s.addToast);
  const dismissToast = useToastStore((s) => s.dismissToast);

  const toast = useCallback(
    (options: ToastOptions) => {
      return addToast({
        message: options.message,
        variant: options.variant ?? 'info',
        onUndo: options.onUndo,
        duration: options.duration ?? 3000,
      });
    },
    [addToast],
  );

  const dismiss = useCallback(
    (id: string) => {
      dismissToast(id);
    },
    [dismissToast],
  );

  return { toast, dismiss };
}
