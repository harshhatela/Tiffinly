import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useSettings } from '../hooks/useSettings';
import { useOrders } from '../hooks/useOrders';
import { BottomSheet } from '../components/ui/BottomSheet';
import {
  formatMonth,
  toYM,
  toYMD,
  isToday,
  isFuture,
  formatCurrency,
} from '../utils/dateHelpers';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const DoodleCircle = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none scale-[1.1]" viewBox="0 0 100 100">
    <path d="M50,10 C75,12 90,30 88,55 C86,80 65,92 40,88 C15,84 8,60 12,35 C16,10 40,8 50,10 Z" fill="none" stroke="#FF6B2C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoodleX = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none scale-[0.6]" viewBox="0 0 100 100">
    <path d="M20,20 C40,40 60,60 80,80 M80,20 C60,40 40,60 20,80" fill="none" stroke="#9CA3AF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoodleDot = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none scale-[1]" viewBox="0 0 100 100">
    <circle cx="50" cy="85" r="7" fill="#FF6B2C" />
  </svg>
);

// A safer getMonthDays that returns day numbers 1-31
function getSafeMonthDays(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
}

export default function Calendar() {
  const { settings, loading: settingsLoading } = useSettings();
  const { orders, logOrder, removeOrder } = useOrders();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSheet, setShowSheet] = useState(false);

  if (settingsLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 font-medium animate-pulse">Loading...</div>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthYM = toYM(currentDate);
  const days = getSafeMonthDays(year, month);
  const firstDay = new Date(year, month - 1, 1);
  const dayOfWeek = firstDay.getDay(); // 0=Sun
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0
  const monthName = formatMonth(currentDate);

  const today = new Date();
  const currentYear  = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const isNextDisabled = (year === currentYear && month >= currentMonth)
                      || (year > currentYear);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    if (!isNextDisabled) {
      setCurrentDate(new Date(year, month, 1));
    }
  };

  const handleDateClick = (day) => {
    const date = new Date(year, month - 1, day);
    if (!isFuture(date)) {
      setSelectedDate(date);
      setShowSheet(true);
    }
  };

  const getDayState = (day) => {
    const date = new Date(year, month - 1, day);
    const dateStr = toYMD(date);
    const dayOrders = orders.filter(o => o.date === dateStr);

    if (dayOrders.length === 0) return 'empty';
    const allOrdered = dayOrders.every(o => o.ordered === true);
    const allSkipped = dayOrders.every(o => o.ordered === false);
    if (allOrdered) return 'all-ordered';
    if (allSkipped) return 'all-skipped';
    return 'partial';
  };

  const monthTotal = orders
    .filter(o => o.date.startsWith(monthYM) && o.ordered)
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const monthOrderCount = orders.filter(o => o.date.startsWith(monthYM) && o.ordered).length;

  return (
    <div className="pb-28">
      <PageHeader title="Calendar" subtitle="Track your orders" />

      <div className="p-4 animate-slideUp stagger-1">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="font-display text-4xl font-extrabold text-gray-900 tracking-tight">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-full bg-cream-100 dark:bg-[#1F1F25]
                         shadow-neu-sm flex items-center justify-center
                         text-gray-600 dark:text-gray-400
                         active:shadow-neu-inset transition-all text-sm font-bold"
            >
              ‹
            </button>
            <button
              onClick={handleNextMonth}
              disabled={isNextDisabled}
              className="w-9 h-9 rounded-full bg-cream-100 dark:bg-[#1F1F25]
                         shadow-neu-sm flex items-center justify-center
                         text-gray-600 dark:text-gray-400
                         active:shadow-neu-inset transition-all text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="mx-4 bg-white dark:bg-[#17171B] rounded-4xl shadow-card p-5">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="w-10 h-10 mx-auto" />
            ))}

            {/* Day cells */}
            {days.map((day, dayIndex) => {
              const date = new Date(year, month - 1, day);
              const state = getDayState(day);
              const isTodayCell = isToday(date);
              const isFutureDay = isFuture(date);

              let cellClass = 'w-10 h-10 mx-auto flex flex-col items-center justify-center relative rounded-2xl active:scale-[0.96] transition-transform duration-[80ms] ease-out select-none touch-manipulation animate-slide-up opacity-0 [animation-fill-mode:forwards] ';
              let textClass = 'font-display font-medium text-[17px] z-10 ';
              let marker = null;

              if (isFutureDay) {
                cellClass += 'opacity-30 pointer-events-none ';
                textClass += 'text-gray-400 ';
              } else if (state === 'all-ordered') {
                textClass += 'font-bold text-gray-900 ';
                marker = <DoodleCircle />;
              } else if (state === 'partial') {
                textClass += 'font-bold text-gray-900 ';
                marker = <DoodleDot />;
              } else if (state === 'all-skipped') {
                textClass += 'text-gray-400 ';
                marker = <DoodleX />;
              } else if (isTodayCell) {
                textClass += 'font-bold text-primary ';
                cellClass += 'bg-primary/10 ';
              } else {
                textClass += 'text-gray-500 ';
              }

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={isFutureDay}
                  style={{ animationDelay: `${dayIndex * 12}ms` }}
                  className={cellClass}
                >
                  <span className={textClass}>{day}</span>
                  {marker}
                </button>
              );
            })}
          </div>

          {monthOrderCount === 0 && !isFuture(new Date(year, month - 1, 1)) && (
            <div className="py-8 flex flex-col items-center gap-2 text-center">
              <span className="text-4xl">☀️</span>
              <p className="font-bold text-base text-gray-900">No orders this month</p>
              <p className="font-medium text-sm text-gray-400 max-w-[220px]">
                Use the Home screen to start tracking, or import from WhatsApp.
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 relative flex items-center justify-center"><DoodleCircle /><span className="text-[11px] font-bold text-gray-900 z-10">8</span></div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ordered</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 relative flex items-center justify-center"><DoodleDot /><span className="text-[11px] font-bold text-gray-900 z-10">8</span></div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Partial</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 relative flex items-center justify-center"><DoodleX /><span className="text-[11px] font-bold text-gray-400 z-10">8</span></div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Skipped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day detail sheet */}
      {selectedDate && (
        <DayDetailSheet
          date={selectedDate}
          settings={settings}
          orders={orders}
          onClose={() => setShowSheet(false)}
          isOpen={showSheet}
          onSave={logOrder}
          onDelete={removeOrder}
        />
      )}
    </div>
  );
}

function DayDetailSheet({ date, settings, orders, isOpen, onClose, onSave, onDelete }) {
  const dateStr = toYMD(date);
  const dayOrders = orders.filter(o => o.date === dateStr);

  const [mealStates, setMealStates] = useState({
    breakfast: dayOrders.find(o => o.mealType === 'breakfast')?.ordered ?? null,
    lunch: dayOrders.find(o => o.mealType === 'lunch')?.ordered ?? null,
    dinner: dayOrders.find(o => o.mealType === 'dinner')?.ordered ?? null,
  });

  const handleSetMealState = (mealType, newState) => {
    setMealStates(prev => ({ ...prev, [mealType]: newState }));
  };

  const handleDeleteMealRecord = async (mealKey) => {
    const existing = dayOrders.find(o => o.mealType === mealKey);
    if (existing && onDelete) {
      await onDelete(existing.id);
    }
    setMealStates(prev => ({ ...prev, [mealKey]: null }));
  };

  const handleSave = async () => {
    for (const meal of Object.keys(mealStates)) {
      if (settings.meals[meal].enabled && mealStates[meal] !== null) {
        await onSave({
          date: dateStr,
          mealType: meal,
          ordered: mealStates[meal],
          isHoliday: false,
          amount: settings.meals[meal].price,
          source: 'manual',
        });
      }
    }
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={date.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}
    >
      <div className="space-y-4 pt-2">
        {Object.keys(settings.meals)
          .filter(meal => settings.meals[meal].enabled)
          .map(meal => {
            const existingOrder = { ordered: mealStates[meal] };
            return (
              <div key={meal} className="bg-cream-50 p-4 rounded-3xl border border-cream-200">
                <label className="block text-sm font-bold text-gray-900 px-1">
                  <span className="text-lg mr-2">{settings.meals[meal].emoji}</span>
                  {settings.meals[meal].label}
                </label>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleSetMealState(meal, true)}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95
                      ${existingOrder?.ordered === true
                        ? 'bg-gray-900 text-white shadow-card'
                        : 'bg-white text-gray-400 border border-gray-200'
                      }`}
                  >
                    ✓ Ordered
                  </button>
                  <button
                    onClick={() => handleSetMealState(meal, false)}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95
                      ${existingOrder?.ordered === false
                        ? 'bg-gray-900 text-white shadow-card'
                        : 'bg-white text-gray-400 border border-gray-200'
                      }`}
                  >
                    ✗ Skipped
                  </button>
                  <button
                    onClick={() => handleDeleteMealRecord(meal)}
                    disabled={existingOrder?.ordered === null}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-red-400 bg-red-50 border border-red-100 disabled:opacity-30 active:scale-95 transition-all"
                    title="Delete record"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-6 bg-arty-gradient text-white py-4 rounded-3xl font-bold text-lg shadow-arty hover:shadow-arty-sm transition-all press-effect active:scale-95"
      >
        Save Changes
      </button>
    </BottomSheet>
  );
}
