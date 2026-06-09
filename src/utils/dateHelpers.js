/**
 * Date utility functions for Tiffinly
 */

export function formatDisplay(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-IN', options);
}

export function formatMonth(date) {
  const options = { year: 'numeric', month: 'long' };
  return new Date(date).toLocaleDateString('en-IN', options);
}

export function toYMD(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toYM(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthDays(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month - 1, i));
  }
  return days;
}

export function getWeekNumber(date) {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const weekNumber = Math.ceil((d.getDate() + firstDay.getDay()) / 7);
  return weekNumber;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function isSameDay(a, b) {
  return toYMD(a) === toYMD(b);
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function isFuture(date) {
  return new Date(date) > new Date();
}

export function isPast(date) {
  return new Date(date) < new Date() && !isToday(date);
}

export function formatDMY(dateString) {
  // Expects 'YYYY-MM-DD', returns 'DD/MM/YYYY'
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function parseYMDFromDMY(dmy) {
  // Expects 'DD/MM/YYYY', returns 'YYYY-MM-DD'
  const [day, month, year] = dmy.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
