import { useNavigate, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';

export default function PageHeader({ title, subtitle }) {
  const navigate       = useNavigate();
  const { pathname }   = useLocation();
  const isHome         = pathname === '/';
  return (
    <header className="bg-white dark:bg-[#0C0C0F] px-4 pt-12 pb-4
                        sticky top-0 z-30
                        border-b border-gray-100 dark:border-[#1F1F25]
                        shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {isHome ? (
            <img
              src="/logo.png"
              alt="Tiffinly"
              className="h-7 object-contain object-left"
              style={{ maxWidth: '120px' }}
            />
          ) : (
            <>
              <h1 className="font-display font-bold text-xl text-gray-900
                             dark:text-gray-100 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="font-sans text-xs text-gray-400 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>

        {/* Settings gear — only on Home */}
        {isHome && (
          <button
            onClick={() => navigate('/settings')}
            className="btn-tactile w-9 h-9 rounded-xl bg-cream-100 dark:bg-[#1F1F25]
                       border border-cream-200 dark:border-[#30303A]
                       shadow-neu-sm flex items-center justify-center ml-3 flex-shrink-0
                       active:shadow-neu-inset transition-all"
          >
            <Settings
              size={17}
              className="text-gray-600 dark:text-gray-300"
              strokeWidth={2}
            />
          </button>
        )}
      </div>
    </header>
  );
}
