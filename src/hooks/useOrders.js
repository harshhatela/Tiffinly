import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import { supabase, isCloudEnabled } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (user && isCloudEnabled()) {
      // Cloud mode: fetch from Supabase, mirror into Dexie cache
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: true });
      if (!error && data) {
        const mapped = data.map(o => ({
          id: o.id, date: o.date, mealType: o.meal_type,
          ordered: o.ordered, isHoliday: o.is_holiday,
          amount: o.amount, source: o.source,
        }));
        setOrders(mapped);
        // Mirror to Dexie for offline reads
        await db.orders.clear();
        await db.orders.bulkAdd(mapped.map(({ id, ...rest }) => rest));
      } else {
        // Network failed — fall back to Dexie cache
        const cached = await db.orders.toArray();
        setOrders(cached);
      }
    } else {
      // Guest mode: Dexie only, unchanged from before
      const local = await db.orders.toArray();
      setOrders(local);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const logOrder = async (order) => {
    if (user && isCloudEnabled()) {
      const { error } = await supabase.from('orders').upsert({
        user_id:   user.id,
        date:      order.date,
        meal_type: order.mealType,
        ordered:   order.ordered,
        is_holiday: order.isHoliday,
        amount:    order.amount,
        source:    order.source,
      }, { onConflict: 'user_id,date,meal_type' });

      if (error && !navigator.onLine) {
        // Queue for later sync when offline — store in Dexie with a pending flag
        await db.orders.put({ ...order, _pendingSync: true });
      }
    } else {
      // Guest mode upsert — exact existing logic
      const existing = await db.orders
        .where({ date: order.date, mealType: order.mealType })
        .first();
      if (existing) {
        await db.orders.update(existing.id, order);
      } else {
        await db.orders.add(order);
      }
    }
    await loadOrders();
  };

  const removeOrder = async (id) => {
    if (user && isCloudEnabled()) {
      await supabase.from('orders').delete().eq('id', id);
    } else {
      await db.orders.delete(id);
    }
    await loadOrders();
  };

  const getOrdersForMonth = (month) =>
    orders.filter(o => o.date.startsWith(month));

  const getOrdersForDate = (date) =>
    orders.filter(o => o.date === date);

  return { orders, loading, logOrder, removeOrder, getOrdersForMonth, getOrdersForDate, refreshOrders: loadOrders };
}
