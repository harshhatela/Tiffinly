import { useState, useEffect } from 'react';
import { db } from '../db/db';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const logOrder = async (orderData) => {
    try {
      const { date, mealType, ordered, isHoliday, amount, source } = orderData;
      
      // Check if order exists for this date + mealType
      const existing = await db.orders
        .where('date').equals(date)
        .and(o => o.mealType === mealType)
        .first();

      if (existing) {
        // Update
        await db.orders.update(existing.id, { ordered, isHoliday, amount, source });
      } else {
        // Insert
        await db.orders.add({ date, mealType, ordered, isHoliday, amount, source });
      }

      // Refresh orders
      const allOrders = await db.orders.toArray();
      setOrders(allOrders);
    } catch (err) {
      console.error('Error logging order:', err);
    }
  };

  const removeOrder = async (orderId) => {
    try {
      await db.orders.delete(orderId);
      const allOrders = await db.orders.toArray();
      setOrders(allOrders);
    } catch (err) {
      console.error('Error removing order:', err);
    }
  };

  const getOrdersForDate = (dateString) => {
    return orders.filter(o => o.date === dateString);
  };

  const getOrdersForMonth = (monthString) => {
    return orders.filter(o => o.date.startsWith(monthString));
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await db.orders.toArray();
      setOrders(allOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return { orders, loading, logOrder, removeOrder, getOrdersForDate, getOrdersForMonth, loadOrders };
}
