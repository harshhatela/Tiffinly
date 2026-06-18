import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageSquare, BarChart2 } from 'lucide-react';

const TABS = [
  { path: '/',         Icon: Home,          label: 'Home'     },
  { path: '/calendar', Icon: Calendar,      label: 'Calendar' },
  { path: '/parser',   Icon: MessageSquare, label: 'Import'   },
  { path: '/reports',  Icon: BarChart2,     label: 'Reports'  },
];

export default function BottomNav() {
  const navigate       = useNavigate();
  const { pathname }   = useLocation();
  const activeIdx      = TABS.findIndex(t => t.path === pathname);
  const safeIdx        = activeIdx === -1 ? 0 : activeIdx;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-2">
      {/*
       * Outer container: dark pill bar
       * Inner: relative wrapper for the sliding indicator pill
       */}
      <div
        className="relative bg-[#1A1A1E] rounded-full flex items-center p-1.5
                   shadow-[0_-2px_20px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.2)]"
      >
        {/* ── SLIDING ORANGE PILL ──────────────────────────────────── */}
        {/*
         * Positions using calc():
         *   Each of 4 tabs = 25% of the bar.
         *   Pill left = (activeIdx * 25%) + 6px left-padding.
         *   Pill width = 25% - 12px (6px padding on each side).
         *   CSS transition slides it smoothly.
         */}
        <div
          className="absolute rounded-full bg-primary z-0
                     shadow-[0_4px_16px_rgba(255,107,44,0.35)]"
          style={{
            height:     'calc(100% - 12px)',
            width:      'calc(25% - 12px)',
            top:        '6px',
            left:       `calc(${safeIdx} * 25% + 6px)`,
            transition: 'left 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* ── TAB BUTTONS ──────────────────────────────────────────── */}
        {TABS.map((tab, i) => {
          const isActive = i === safeIdx;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex items-center justify-center gap-1.5
                         py-3 rounded-full z-10 relative
                         active:scale-95 transition-transform duration-100
                         select-none touch-manipulation"
            >
              <tab.Icon
                size={isActive ? 17 : 19}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`transition-colors duration-200 flex-shrink-0
                  ${isActive ? 'text-white' : 'text-gray-500'}`}
              />
              {/*
               * Label only shows for active tab.
               * animate-fade-in prevents jarring pop-in.
               * whitespace-nowrap prevents wrapping on narrow screens.
               */}
              {isActive && (
                <span
                  className="text-white text-[11px] font-semibold font-sans
                             whitespace-nowrap leading-none"
                  style={{ animation: 'fadeLabel 200ms ease-out forwards' }}
                >
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
