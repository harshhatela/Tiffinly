import Dexie from 'dexie';

export const db = new Dexie('TiffinlyDB');

db.version(1).stores({
  orders:   '++id, date, mealType, ordered, isHoliday, amount, source',
  settings: '++id',
  payments: '++id, month',
});

// Default settings shape
export const DEFAULT_SETTINGS = {
  id: 1,
  serviceName: '',
  whatsappName: '',
  onboardingComplete: false,
  meals: {
    breakfast: { enabled: false, price: 0,   emoji: '🌅', label: 'Breakfast' },
    lunch:     { enabled: true,  price: 100, emoji: '🍱', label: 'Lunch' },
    dinner:    { enabled: true,  price: 80,  emoji: '🌙', label: 'Dinner' },
  },
};

// Order object shape (for reference):
// {
//   id:        number,    // auto-increment
//   date:      string,    // 'YYYY-MM-DD'
//   mealType:  string,    // 'breakfast' | 'lunch' | 'dinner'
//   ordered:   boolean,   // true = ordered, false = skipped
//   isHoliday: boolean,   // service was closed
//   amount:    number,    // price at time of logging
//   source:    string,    // 'manual' | 'parser'
// }

// Payment object shape:
// { id, month: 'YYYY-MM', amount: number, paid: boolean, paidDate: string|null }
