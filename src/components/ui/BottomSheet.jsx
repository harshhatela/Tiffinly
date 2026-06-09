import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function BottomSheet({ isOpen, onClose, title, children }) {
  const [showSheet, setShowSheet] = useState(isOpen);

  useEffect(() => {
    setShowSheet(isOpen);
  }, [isOpen]);

  if (!showSheet) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 animate-fadeIn"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-card max-w-[430px] mx-auto animate-fadeIn">
        {/* Handle and header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
