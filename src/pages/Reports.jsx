import { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useSettings } from '../hooks/useSettings';
import { useOrders } from '../hooks/useOrders';
import { useMonthlyTotal } from '../hooks/useMonthlyTotal';
import { db } from '../db/db';
import { toYM, formatMonth, getWeekNumber, formatCurrency } from '../utils/dateHelpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Share2, CheckCircle2, Circle } from 'lucide-react';

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  return {
    label: formatMonth(d),
    value: toYM(d),
  };
});

export default function Reports() {
  const { settings } = useSettings();
  const { orders } = useOrders();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0].value);
  const [paymentStatus, setPaymentStatus] = useState({});
  const monthStats = useMonthlyTotal(orders, selectedMonth);

  useEffect(() => {
    const loadPaymentStatus = async () => {
      const payment = await db.payments.where('month').equals(selectedMonth).first();
      setPaymentStatus(payment || { paid: false });
    };
    loadPaymentStatus();
  }, [selectedMonth]);

  const handleTogglePaid = async () => {
    const newStatus = !paymentStatus.paid;
    try {
      const existing = await db.payments.where('month').equals(selectedMonth).first();
      if (existing) {
        await db.payments.update(existing.id, {
          paid: newStatus,
          paidDate: newStatus ? new Date().toISOString().split('T')[0] : null,
        });
      } else {
        await db.payments.add({
          month: selectedMonth,
          amount: monthStats.totalAmount,
          paid: newStatus,
          paidDate: newStatus ? new Date().toISOString().split('T')[0] : null,
        });
      }
      setPaymentStatus(prev => ({ ...prev, paid: newStatus }));
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const handleShare = async () => {
    const breakdown = monthStats.breakdown;
    const text = [
      `📦 Tiffinly — ${formatMonth(new Date(selectedMonth + '-01'))} Summary`,
      `━━━━━━━━━━━━━━━━━━`,
      breakdown.breakfast?.count > 0 ? `🌅 Breakfast: ${breakdown.breakfast.count} × ${formatCurrency(settings.meals.breakfast.price)} = ${formatCurrency(breakdown.breakfast.amount)}` : null,
      breakdown.lunch?.count > 0     ? `🍱 Lunch:     ${breakdown.lunch.count} × ${formatCurrency(settings.meals.lunch.price)} = ${formatCurrency(breakdown.lunch.amount)}` : null,
      breakdown.dinner?.count > 0    ? `🌙 Dinner:    ${breakdown.dinner.count} × ${formatCurrency(settings.meals.dinner.price)} = ${formatCurrency(breakdown.dinner.amount)}` : null,
      `━━━━━━━━━━━━━━━━━━`,
      `Total: ${monthStats.orderCount} orders · ${formatCurrency(monthStats.totalAmount)}`,
      `Status: ${paymentStatus.paid ? 'Paid ✓' : 'Unpaid'}`,
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      await navigator.share({ title: 'Tiffinly Summary', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Summary copied to clipboard!');
    }
  };

  const chartData = generateChartData(orders, selectedMonth);

  return (
    <div className="pb-28">
      <PageHeader title="Reports" subtitle="Your tiffin analytics" />

      <div className="p-4 space-y-6">
        {/* Month selector */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar animate-slideUp stagger-1">
          {MONTHS.map(m => (
            <button
              key={m.value}
              onClick={() => setSelectedMonth(m.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-transform active:scale-[0.965] ${
                selectedMonth === m.value
                  ? 'bg-primary text-white shadow-orange'
                  : 'bg-white text-gray-500 shadow-soft border border-cream-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Summary card */}
        <div className="bg-gradient-to-br from-primary to-primary-600 rounded-4xl p-5 shadow-orange animate-slideUp stagger-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider">{formatMonth(new Date(selectedMonth + '-01'))}</p>
              <p className="text-white font-extrabold text-4xl leading-none mt-1">{formatCurrency(monthStats.totalAmount)}</p>
              <p className="text-primary-100 text-sm font-medium mt-1">{monthStats.orderCount} tiffins ordered</p>
            </div>
            {/* Paid/Unpaid toggle */}
            <button
              onClick={handleTogglePaid}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.965] ${
                paymentStatus.paid
                  ? 'bg-green-400 text-white shadow-sm'
                  : 'bg-white/20 text-white border border-white/30'
              }`}
            >
              {paymentStatus.paid ? '✓ Paid' : 'Unpaid'}
            </button>
          </div>
          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-full py-2.5 rounded-2xl bg-white/15 border border-white/25 text-white font-semibold text-sm transition-transform active:scale-[0.965]"
          >
            Share Summary ↗
          </button>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-soft animate-slideUp stagger-3">
            <h3 className="font-bold text-gray-900 mb-6 px-1">Order Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="count" fill="#FF6B2C" radius={[6, 6, 6, 6]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#FF6B2C' : '#FFC4A0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Meal breakdown */}
        <div className="bg-white rounded-3xl p-5 shadow-soft animate-slideUp stagger-4">
          <h3 className="font-bold text-gray-900 mb-4">Breakdown</h3>
          <div className="flex flex-col">
            {Object.keys(settings.meals)
              .filter(meal => settings.meals[meal].enabled)
              .map(meal => {
                const mealColors = {
                  breakfast: { bg: 'bg-breakfast-bg' },
                  lunch: { bg: 'bg-lunch-bg' },
                  dinner: { bg: 'bg-dinner-bg' }
                };
                const bgClass = mealColors[meal]?.bg || 'bg-lunch-bg';
                
                return (
                  <div key={meal} className="flex items-center justify-between py-3 border-b border-cream-200">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl ${bgClass} flex items-center justify-center text-base`}>
                        {settings.meals[meal].emoji}
                      </span>
                      <span className="font-semibold text-sm text-gray-900">{settings.meals[meal].label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900">{formatCurrency(monthStats.breakdown[meal]?.amount || 0)}</p>
                      <p className="font-medium text-xs text-gray-400">{monthStats.breakdown[meal]?.count || 0} orders</p>
                    </div>
                  </div>
                );
              })}
            <div className="flex items-center justify-between pt-3">
              <span className="font-bold text-base text-gray-900">Total</span>
              <span className="font-extrabold text-lg text-primary">{formatCurrency(monthStats.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateChartData(orders, month) {
  const monthOrders = orders.filter(o => o.date.startsWith(month) && o.ordered);
  const weeklyData = {};

  monthOrders.forEach(order => {
    const date = new Date(order.date);
    const week = `W${getWeekNumber(date)}`;
    weeklyData[week] = (weeklyData[week] || 0) + 1;
  });

  return Object.entries(weeklyData).map(([name, count]) => ({
    name,
    count,
  }));
}
