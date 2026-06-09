import { useMemo } from 'react';

export function useMonthlyTotal(orders, month) {
  const stats = useMemo(() => {
    const monthOrders = orders.filter(
      o => o.date.startsWith(month) && o.ordered === true
    );

    const totalAmount = monthOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const orderCount = monthOrders.length;

    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const breakdown = {};
    for (const meal of mealTypes) {
      const mealOrders = monthOrders.filter(o => o.mealType === meal);
      breakdown[meal] = {
        count: mealOrders.length,
        amount: mealOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
      };
    }

    return { totalAmount, orderCount, breakdown };
  }, [orders, month]);

  return stats;
}

