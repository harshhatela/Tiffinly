import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageSquare, BarChart2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const TABS = [
  { path: '/',         Icon: Home,          label: 'Home'     },
  { path: '/calendar', Icon: Calendar,      label: 'Calendar' },
  { path: '/parser',   Icon: MessageSquare, label: 'Import'   },
  { path: '/reports',  Icon: BarChart2,     label: 'Reports'  },
];

export default function BottomNav() {
  const navigate   = useNavigate();
  const { pathname } = useLocation();

  const activeIdx  = TABS.findIndex(t => t.path === pathname);
  const safeIdx    = activeIdx === -1 ? 0 : activeIdx;
  const ActiveIcon = TABS[safeIdx].Icon;

  // Bubble pops on each tab change
  const [popKey, setPopKey] = useState(0);
  const prevIdx = useRef(safeIdx);
  useEffect(() => {
    if (prevIdx.current !== safeIdx) {
      setPopKey(k => k + 1);
      prevIdx.current = safeIdx;
    }
  }, [safeIdx]);

  return (
    /*
     * ARCHITECTURE:
     * fixed container → relative inner → absolute bubble + dark bar
     *
     * The bubble has top: -28px which places its CENTER at the top edge
     * of the dark bar (bubble is 56px tall, so top half is above the bar).
     * left uses calc() to slide between tab centers.
     */
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pointer-events-none">
      <div className="relative pointer-events-auto">

        {/* ── ACTIVE BUBBLE ──────────────────────────────────────────── */}
        {/*
         * Positioned absolutely above the bar.
         * top: -28px means the bubble center sits exactly at the bar's top edge.
         * left: calc(N * 25% + 12.5% - 28px) centers it on tab N.
         *   - Each of 4 tabs occupies 25% of the bar.
         *   - Tab center is at (N * 25% + 12.5%) from the bar's left.
         *   - Subtract 28px (half the 56px bubble width) to left-anchor correctly.
         * transition-all animates the slide smoothly between tabs.
         */}
        <div
          key={popKey}
          className="absolute w-14 h-14 rounded-full bg-primary z-10
                     flex items-center justify-center
                     shadow-[0_6px_28px_rgba(255,107,44,0.5),0_2px_8px_rgba(255,107,44,0.3)]"
          style={{
            top:        '-28px',
            left:       `calc(${safeIdx} * 25% + 12.5% - 28px)`,
            transition: 'left 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            animation:  'bubblePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <ActiveIcon size={22} className="text-white" strokeWidth={2.5} />
        </div>

        {/* ── DARK BAR ──────────────────────────────────────────────── */}
        <div
          className="bg-[#1C1C1E] rounded-[28px] flex items-center px-2 py-3
                     shadow-[0_-2px_20px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.15)]"
        >
          {TABS.map((tab, i) => {
            const isActive = i === safeIdx;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex-1 flex flex-col items-center gap-1 py-1.5
                           active:scale-90 transition-transform duration-100 select-none"
              >
                {/*
                 * Active tab: show an invisible placeholder the same size as the icon.
                 * The real icon is in the bubble above — we just need to preserve layout.
                 */}
                {isActive
                  ? <div className="w-5 h-5" aria-hidden />
                  : <tab.Icon
                      size={20}
                      strokeWidth={1.5}
                      className="text-gray-500 transition-colors duration-200"
                    />
                }
                <span
                  className={`text-[10px] font-semibold font-sans transition-colors duration-200
                    ${isActive ? 'text-primary' : 'text-gray-500'}`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
