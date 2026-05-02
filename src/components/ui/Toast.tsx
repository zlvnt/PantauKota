'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const TOAST_STYLES = {
  success: 'bg-tertiary/10 border-tertiary/20 text-tertiary',
  error: 'bg-error/10 border-error/20 text-error',
  info: 'bg-primary/10 border-primary/20 text-primary',
  warning: 'bg-[#f59e0b]/10 border-[#f59e0b]/20 text-[#f59e0b]',
};

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to finish
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = TOAST_ICONS[type];
  const styles = TOAST_STYLES[type];

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-[0_8px_30px_rgba(42,52,57,0.12)] ${styles} bg-surface-container-lowest`}
      >
        <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
        <p className="text-sm font-semibold text-on-surface">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 p-1 rounded-lg hover:bg-surface-container-low transition-colors"
        >
          <X className="w-4 h-4 text-on-surface/60" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
