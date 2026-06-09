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
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const { settings } = useSettings();
  const { orders, logOrder } = useOrders();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSheet, setShowSheet] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthYM = toYM(currentDate);
  const days = getSafeMonthDays(year, month);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  const monthName = formatMonth(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    if (!isFuture(new Date(year, month + 1, 1))) {
      setCurrentDate(new Date(year, month, 1));
    }
  };

  const handleDateClick = (day) => {
    if (!isFuture(new Date(year, month - 1, day))) {
      setSelectedDate(new Date(year, month - 1, day));
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
        <div className="flex items-center justify-between mb-6 bg-white rounded-3xl p-2 shadow-card">
          <button
            onClick={handlePrevMonth}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors press-effect"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 tracking-wide">{monthName}</h2>
          <button
            onClick={handleNextMonth}
            disabled={isFuture(new Date(year, month, 1))}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed press-effect"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Calendar Card */}
        <div className="bg-cream-50 rounded-4xl shadow-soft p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="w-10 h-10 mx-auto" />
            ))}

            {/* Day cells */}
            {days.map(day => {
              const date = new Date(year, month - 1, day);
              const state = getDayState(day);
              const isTodayCell = isToday(date);
              const isFutureDay = isFuture(date);

              let cellClass = 'w-10 h-10 mx-auto rounded-2xl flex items-center justify-center transition-transform active:scale-[0.965] ';
              let textClass = 'font-medium text-sm ';

              if (isFutureDay) {
                cellClass += 'opacity-30 pointer-events-none';
                textClass += 'text-gray-400';
              } else if (state === 'all-ordered' || state === 'partial') {
                cellClass += 'bg-primary shadow-orange';
                textClass += 'text-white font-bold';
              } else if (state === 'all-skipped') {
                cellClass += 'bg-cream-200';
                textClass += 'text-gray-400 line-through';
              } else if (isTodayCell) {
                cellClass += 'border-2 border-primary';
                textClass += 'text-primary font-bold';
              } else {
                textClass += 'text-gray-500';
              }

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={isFutureDay}
                  className={cellClass}
                >
                  <span className={textClass}>{day}</span>
                </button>
              );
            })}
          </div>

          {monthOrderCount === 0 && !isFuture(new Date(year, month - 1, 1)) && (
            <div className="py-8 flex flex-col items-center gap-2 text-center">
              <span className="text-4xl">🍱</span>
              <p className="font-bold text-base text-gray-900">No orders this month</p>
              <p className="font-medium text-sm text-gray-400 max-w-[220px]">
                Use the Home screen to start tracking, or import from WhatsApp.
              </p>
            </div>
          )}

          {/* Footer summary */}
          <div className="mt-4 pt-4 border-t border-cream-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">{monthOrderCount} orders this month</span>
            <span className="font-bold text-base text-primary">{formatCurrency(monthTotal)}</span>
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
        />
      )}
    </div>
  );
}

function DayDetailSheet({ date, settings, orders, isOpen, onClose, onSave }) {
  const dateStr = toYMD(date);
  const dayOrders = orders.filter(o => o.date === dateStr);

  const [mealStates, setMealStates] = useState({
    breakfast: dayOrders.find(o => o.mealType === 'breakfast')?.ordered ?? null,
    lunch: dayOrders.find(o => o.mealType === 'lunch')?.ordered ?? null,
    dinner: dayOrders.find(o => o.mealType === 'dinner')?.ordered ?? null,
  });

  const handleMealChange = (mealType, newState) => {
    setMealStates(prev => ({ ...prev, [mealType]: newState }));
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
          .map(meal => (
            <div key={meal} className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-3 px-1">
                <span className="text-lg mr-2">{settings.meals[meal].emoji}</span>
                {settings.meals[meal].label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleMealChange(meal, true)}
                  className={`flex-1 py-3 px-2 rounded-2xl font-bold text-sm transition-all press-effect ${
                    mealStates[meal] === true
                      ? 'bg-arty-gradient text-white shadow-arty-sm'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-200'
                  }`}
                >
                  Ordered
                </button>
                <button
                  onClick={() => handleMealChange(meal, false)}
                  className={`flex-1 py-3 px-2 rounded-2xl font-bold text-sm transition-all press-effect ${
                    mealStates[meal] === false
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Skipped
                </button>
                <button
                  onClick={() => handleMealChange(meal, null)}
                  className={`w-14 py-3 rounded-2xl font-bold text-lg transition-all press-effect ${
                    mealStates[meal] === null
                      ? 'bg-gray-300 text-white shadow-inner'
                      : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  -
                </button>
              </div>
            </div>
          ))}
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
