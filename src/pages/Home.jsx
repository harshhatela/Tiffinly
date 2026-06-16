import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Wifi, WifiOff } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useSettings } from '../hooks/useSettings';
import { useOrders } from '../hooks/useOrders';
import { useMonthlyTotal } from '../hooks/useMonthlyTotal';
import { formatDisplay, getGreeting, toYMD, toYM, formatCurrency } from '../utils/dateHelpers';

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
      <PageHeader
        showLogo={true}
        title={`Good ${greeting}! ${greetingEmoji}`}
        subtitle={formatDisplay(today)}
        rightAction={
          <button
            onClick={() => navigate('/settings')}
            className="p-2.5 bg-white shadow-card hover:shadow-card-hover rounded-2xl transition-all press-effect"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Greeting card with floating emoji and morph blob */}
        <div className="relative overflow-hidden bg-cream-100 shadow-neu rounded-4xl px-5 py-5 mb-4">
          {/* Decorative blob behind content */}
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-primary/10 rounded-full
                          animate-morph-blob blur-xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="font-bold text-xl text-gray-900">
                Good {greeting}! {greetingEmoji}
              </p>
              <p className="font-medium text-sm text-gray-400 mt-0.5">{todayDisplay}</p>
            </div>
            {/* Floating tiffin icon */}
            <span className="text-4xl animate-float select-none">🍱</span>
          </div>
        </div>

        {/* Today's Tiffin Section */}
        <div className="animate-slideUp stagger-1">
          <h2 className="font-bold text-lg text-gray-900 px-1 mb-3">Today's Tiffin</h2>
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
                    className={`relative overflow-hidden w-full flex items-center justify-between rounded-3xl px-5 py-4 border-0 animate-slide-up opacity-0 [animation-fill-mode:forwards] active:shadow-neu-inset active:scale-[0.98] transition-all duration-150 ${
                      isOrdered
                        ? `${colors.bg} shadow-neu-inset`
                        : isSkipped
                        ? 'bg-cream-50 shadow-neu opacity-60'
                        : 'bg-cream-100 shadow-neu'
                    }`}
                  >
                    {/* Ripple effect */}
                    {ripplingMeal === meal && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-8 h-8 rounded-full bg-primary/30 animate-ripple" />
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mealInfo.emoji}</span>
                      <div className="text-left">
                        <p className="font-bold text-base text-gray-900">{mealInfo.label}</p>
                        <p className="font-medium text-sm text-gray-400">{formatCurrency(mealInfo.price)}</p>
                      </div>
                    </div>
                    <span key={state} className={`text-sm font-semibold px-3 py-1 rounded-full animate-pop-in ${
                      isOrdered
                        ? `${colors.text} ${colors.pill}`
                        : isSkipped
                        ? 'text-gray-400 bg-cream-200 line-through'
                        : 'text-gray-400 bg-cream-200'
                    }`}>
                      {isOrdered ? 'Ordered ✓' : isSkipped ? 'Skipped' : 'Tap to order'}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 animate-slideUp stagger-2">
          <div className="flex-1 bg-cream-100 shadow-neu rounded-3xl px-5 py-4 hover:shadow-lifted transition-shadow duration-200">
            <p className="text-primary-400 text-xs font-semibold uppercase tracking-wider mb-1">This Month</p>
            <p className="text-primary font-extrabold text-3xl leading-none">
              <span key={monthStats.totalAmount} className="inline-block animate-count-up">
                {formatCurrency(monthStats.totalAmount)}
              </span>
            </p>
            <p className="text-primary-400 text-xs font-medium mt-1">due to pay</p>
          </div>
          <div className="flex-1 bg-cream-100 shadow-neu rounded-3xl px-5 py-4 hover:shadow-lifted transition-shadow duration-200">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Orders</p>
            <p className="text-gray-900 font-extrabold text-3xl leading-none">
              <span key={monthStats.orderCount} className="inline-block animate-count-up">
                {monthStats.orderCount}
              </span>
            </p>
            <p className="text-gray-400 text-xs font-medium mt-1">this month</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="animate-slideUp stagger-3">
          <h2 className="font-bold text-lg text-gray-900 px-1 mb-3">Recent Activity</h2>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed border-cream-200 rounded-3xl bg-transparent shadow-none">
                <div className="text-4xl mb-3 opacity-50 grayscale">☀️</div>
                <p className="font-medium">No orders yet.</p>
                <p className="text-sm">Tap above to start tracking!</p>
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
