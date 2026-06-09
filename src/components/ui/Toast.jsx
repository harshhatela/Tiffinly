import { useEffect } from 'react';

export function Toast({ message, type = 'success', duration = 2500, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-green-500',
    error:   'bg-red-500',
    info:    'bg-primary',
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg transition-all ${styles[type]}`}>
      {message}
    </div>
  );
}
