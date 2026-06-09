import { useLocation } from 'react-router-dom';
import { Home, Calendar, MessageSquare, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/calendar', label: 'Calendar', Icon: Calendar },
  { path: '/parser', label: 'Import', Icon: MessageSquare },
  { path: '/reports', label: 'Reports', Icon: BarChart2 },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-[28px] shadow-float px-2 py-2 flex items-center justify-around max-w-[398px] mx-auto">
      {tabs.map(({ path, label, Icon }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl transition-all duration-200 active:scale-[0.965] ${
              isActive
                ? 'bg-primary-100 text-primary'
                : 'text-cream-300'
            }`}
          >
            <Icon size={22} className={isActive ? "text-primary" : "text-gray-400"} />
            <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-gray-400'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
