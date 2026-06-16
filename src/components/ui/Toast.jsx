import { useEffect, useState } from 'react';

export function Toast({ message, type = 'success', duration = 2500, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      // Small delay to allow the DOM to render before adding the visible class
      requestAnimationFrame(() => setVisible(true));
      
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, duration);
      
      const closeTimer = setTimeout(() => {
        if (onClose) onClose();
      }, duration + 300); // 300ms for exit animation
      
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-green-500',
    error:   'bg-red-500',
    info:    'bg-primary',
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg transition-all duration-300 ease-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'} ${styles[type]}`}>
      {message}
    </div>
  );
}
