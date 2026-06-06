"use client";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 animate-rise-in rounded-4xl bg-ink px-5 py-3 text-sm text-surface shadow-glow"
    >
      <div className="flex items-center gap-3">
        <span className="text-journal">✦</span>
        <p className="flex-1">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-surface/70 hover:text-surface"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
