import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, DEFAULT_SETTINGS } from './db/db';
import { usePWAInstall } from './hooks/usePWAInstall';
import BottomNav from './components/layout/BottomNav';
import Home      from './pages/Home';
import Calendar  from './pages/Calendar';
import Parser    from './pages/Parser';
import Reports   from './pages/Reports';
import Settings  from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Feedback   from './pages/Feedback';

function AppRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-slide-up">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/parser" element={<Parser />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(null); // null = loading
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { showBanner, install, dismiss } = usePWAInstall();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        let s = await db.settings.get(1);
        if (!s) {
          await db.settings.add(DEFAULT_SETTINGS);
          setOnboardingDone(false);
        } else {
          setOnboardingDone(s.onboardingComplete ?? false);
          if (s.meals?.lunch?.emoji === '🍱') {
            await db.settings.update(1, { meals: { ...s.meals, lunch: { ...s.meals.lunch, emoji: '☀️' } } });
            console.log('Migrated lunch emoji to ☀️');
          }
        }
      } catch (err) {
        console.error('Error initializing app:', err);
        setOnboardingDone(false);
      }
    };
    initializeApp();

    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (onboardingDone === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream-100">
        <img
          src="/icon.png"
          alt="Tiffinly"
          className="w-20 h-20 rounded-3xl shadow-orange animate-pulse"
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="max-w-[430px] mx-auto bg-cream-100 bg-cream-grain min-h-screen relative pb-28">
        {!onboardingDone ? (
          <Routes>
            <Route 
              path="*" 
              element={<Onboarding onComplete={() => setOnboardingDone(true)} />} 
            />
          </Routes>
        ) : (
          <AppRoutes />
        )}

        {showBanner && (
          <div className="fixed bottom-28 left-4 right-4 z-40 bg-white rounded-3xl shadow-lifted
                          px-4 py-3 flex items-center justify-between gap-3 border border-cream-200">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="" className="w-9 h-9 rounded-xl" />
              <div>
                <p className="font-bold text-sm text-gray-900">Add Tiffinly to home screen</p>
                <p className="font-medium text-xs text-gray-400">Quick access, works offline</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={install}
                className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-xl
                           active:scale-95 transition-transform">
                Install
              </button>
              <button onClick={dismiss}
                className="text-gray-400 text-xs font-medium px-2 py-1.5">
                ✕
              </button>
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-30 pointer-events-none">
            <div className="bg-amber-50 border border-amber-200 rounded-full
                            px-4 py-2 flex items-center gap-2 shadow-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <p className="text-amber-700 text-xs font-semibold">
                Offline — data saved locally
              </p>
            </div>
          </div>
        )}

        {onboardingDone && <BottomNav />}
      </div>
    </BrowserRouter>
  );
}
