import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Wifi, WifiOff } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useSettings } from '../hooks/useSettings';
import { useOrders } from '../hooks/useOrders';
import { useMonthlyTotal } from '../hooks/useMonthlyTotal';
import { formatDisplay, getGreeting, toYMD, toYM, formatCurrency } from '../utils/dateHelpers';
import '../styles/MealCard.css';

export default function Home() {
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSettings();
  const { orders, logOrder, removeOrder, getOrdersForDate } = useOrders();
  const today = new Date();
  const todayYMD = toYMD(today);
  const thisMonth = toYM(today);
  const monthStats = useMonthlyTotal(orders, thisMonth);
  const todayOrders = getOrdersForDate(todayYMD);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [ripplingMeal, setRipplingMeal] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 font-medium animate-pulse">Loading Home...</div>
      </div>
    );
  }

  const greeting = getGreeting();
  const greetingEmoji = greeting === 'morning' ? '🌅' : greeting === 'afternoon' ? '👋' : '🌙';
  const todayDisplay = formatDisplay(today);

  const handleMealTap = async (mealKey) => {
    setRipplingMeal(mealKey);
    setTimeout(() => setRipplingMeal(null), 500);

    // Get current record for today + this meal type
    const existing = todayOrders.find(
      o => o.date === todayYMD && o.mealType === mealKey
    );

    if (!existing) {
      // State: no record → tap → log as ORDERED
      await logOrder({
        date:      todayYMD,
        mealType:  mealKey,
        ordered:   true,
        isHoliday: false,
        amount:    settings.meals[mealKey]?.price || 0,
        source:    'manual',
      });
    } else if (existing.ordered === true) {
      // State: ordered → tap → mark as SKIPPED
      await logOrder({
        date:      todayYMD,
        mealType:  mealKey,
        ordered:   false,
        isHoliday: false,
        amount:    0,
        source:    'manual',
      });
    } else {
      // State: skipped → tap → REMOVE record entirely (back to unset)
      await removeOrder(existing.id);
    }
  };

  const getMealButtonState = (mealType) => {
    const order = todayOrders.find(o => o.mealType === mealType);
    if (!order) return 'unset';
    return order.ordered ? 'ordered' : 'skipped';
  };

  return (
    <div className="min-h-screen bg-cream-100 pb-28">
      <PageHeader />

      <div className="p-4 space-y-6">
        {/* Greeting card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-600
                        rounded-4xl px-5 py-5 mb-4 shadow-orange">

          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full
                          bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full
                          bg-black/10 blur-xl pointer-events-none" />

          <div className="relative z-10">
            {/* Small label */}
            <p className="font-sans text-xs font-semibold text-white/70 uppercase tracking-wider mb-0.5">
              TODAY
            </p>
            {/* Date */}
            <p className="font-display font-bold text-white text-sm mb-2">
              {todayDisplay}
            </p>

            <div className="flex items-end justify-between">
              <div>
                <p className="font-sans text-white/80 text-sm mb-0.5">
                  {greeting}, {settings.whatsappName || 'there'}!
                </p>
                <p className="font-display font-bold text-white text-2xl leading-tight">
                  Ready for today's meals?
                </p>
              </div>
              {/* Floating icon */}
              <span className="text-5xl animate-float select-none drop-shadow-lg ml-2">{greetingEmoji}</span>
            </div>

            {/* Inline stats */}
            <div className="flex gap-3 mt-4">
              <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-2.5">
                <p className="font-sans text-white/60 text-[10px] font-semibold uppercase tracking-wider">
                  This Month
                </p>
                <p className="font-display font-extrabold text-white text-xl leading-none mt-0.5">
                  {formatCurrency(monthStats.totalAmount)}
                </p>
              </div>
              <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-2.5">
                <p className="font-sans text-white/60 text-[10px] font-semibold uppercase tracking-wider">
                  Orders
                </p>
                <p className="font-display font-extrabold text-white text-xl leading-none mt-0.5">
                  {monthStats.orderCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Tiffin Section */}
        <div className="animate-slideUp stagger-1">
          <p className="font-display font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">Today's Tiffin</p>
          <div className="space-y-3">
            {Object.keys(settings.meals)
              .filter(meal => settings.meals[meal].enabled)
              .map((meal, index) => {
                const state = getMealButtonState(meal);
                const mealInfo = settings.meals[meal];
                const isOrdered = state === 'ordered';
                const isSkipped = state === 'skipped';

                const mealColors = {
                  breakfast: { bg: 'bg-breakfast-bg', border: 'border-breakfast-ring/30', text: 'text-breakfast-text', pill: 'bg-breakfast-pill' },
                  lunch: { bg: 'bg-lunch-bg', border: 'border-lunch-ring/30', text: 'text-lunch-text', pill: 'bg-lunch-pill' },
                  dinner: { bg: 'bg-dinner-bg', border: 'border-dinner-ring/30', text: 'text-dinner-text', pill: 'bg-dinner-pill' }
                };
                const colors = mealColors[meal] || mealColors.lunch;

                return (
                  <button
                    key={meal}
                    onClick={() => handleMealTap(meal)}
                    style={{ animationDelay: `${index * 80}ms` }}
                    className={`relative overflow-hidden w-full flex items-center justify-between
                                rounded-3xl px-5 py-4 border animate-slide-up opacity-0 [animation-fill-mode:forwards]
                                active:scale-[0.96] transition-all duration-[80ms] ease-out
                                ${isOrdered
                                  ? `${colors.border} meal-card-ordered ${colors.bg} shadow-neu-inset`
                                  : isSkipped
                                  ? 'border-transparent meal-card-skipped'
                                  : 'border-white/10 meal-card-unordered'
                                }`}
                  >
                    {/* Ripple effect */}
                    {ripplingMeal === meal && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-8 h-8 rounded-full bg-primary/30 animate-ripple" />
                      </span>
                    )}
                    <div className="flex items-center gap-3 relative z-10">
                      <span className="text-2xl">{mealInfo.emoji}</span>
                      <div className="text-left">
                        <p className={`font-display font-bold text-base
                          ${!isOrdered && !isSkipped ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                          {mealInfo.label}
                        </p>
                        <p className={`font-sans font-medium text-sm
                          ${!isOrdered && !isSkipped ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatCurrency(mealInfo.price)}
                        </p>
                      </div>
                    </div>
                    <span key={state} className={`text-sm font-semibold font-sans px-3 py-1.5 rounded-full relative z-10 animate-pop-in ${
                      isOrdered
                        ? `${colors.text} ${colors.pill}`
                        : isSkipped
                        ? 'bg-white/10 text-white/50 line-through'
                        : 'bg-white/20 text-white text-xs'
                    }`}>
                      {isOrdered ? 'Ordered ✓' : isSkipped ? 'Skipped' : 'Tap to order'}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>



        {/* Recent Activity */}
        <div className="animate-slideUp stagger-3">
          <p className="font-display font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">Recent Activity</p>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <span className="text-5xl opacity-40">🍽️</span>
                <p className="font-display font-semibold text-base text-gray-400">
                  No orders yet
                </p>
                <p className="font-sans text-sm text-gray-400 text-center max-w-[200px]">
                  Tap a meal above to start tracking today's tiffin
                </p>
              </div>
            ) : (
              orders
                .filter(o => o.date.startsWith(thisMonth) && o.ordered)
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 7)
                .map((order, i) => {
                  const date = new Date(order.date);
                  const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
                  const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                  
                  const mealColors = {
                    breakfast: { pill: 'bg-breakfast-pill', text: 'text-breakfast-text', char: 'B' },
                    lunch: { pill: 'bg-lunch-pill', text: 'text-lunch-text', char: 'L' },
                    dinner: { pill: 'bg-dinner-pill', text: 'text-dinner-text', char: 'D' }
                  };
                  const mColor = mealColors[order.mealType] || mealColors.lunch;

                  return (
                    <div
                      key={`${order.date}-${order.mealType}-${i}`}
                      className="bg-white rounded-2xl px-4 py-3 shadow-soft flex items-center justify-between border border-cream-200"
                    >
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{dayName}</p>
                        <p className="font-medium text-xs text-gray-400">{dateStr}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${mColor.pill} ${mColor.text}`}>
                          {mColor.char}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-gray-900">{formatCurrency(order.amount)}</p>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
