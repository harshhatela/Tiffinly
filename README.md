# Tiffinly - Tiffin Order Tracker PWA

A Progressive Web App for tracking tiffin (Indian meal service) orders. Students use tiffin services for daily meals and Tiffinly helps them track what they've ordered and how much they owe.

## Features

- 🍱 **Order Tracking** — Log breakfast, lunch, and dinner orders daily
- 📅 **Calendar View** — Visual overview of all your orders
- 💬 **WhatsApp Import** — Bulk import orders from group chat exports
- 📊 **Analytics** — Track spending and order trends
- 💾 **Offline First** — All data stored locally in IndexedDB, works without internet
- 📱 **Mobile App** — Installable as a native-feeling app on your home screen
- 🎨 **Modern UI** — Clean card-based design with warm orange color scheme

## Tech Stack

- **React 18** — UI framework
- **Vite** — Fast build tool
- **Tailwind CSS** — Styling
- **Dexie** — IndexedDB wrapper for offline storage
- **Recharts** — Analytics visualizations
- **Lucide React** — Icons
- **React Router** — Navigation
- **PWA Plugin** — Progressive Web App capabilities

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## How to Use

### Onboarding
1. Enter your tiffin service name
2. Select which meals you subscribe to (Breakfast, Lunch, Dinner)
3. Set prices for each meal
4. Enter your name as it appears in the tiffin group

### Daily Tracking
- On the Home page, tap each meal to mark as "Ordered", "Skipped", or unset
- Updates are saved automatically to your device

### Calendar View
- See all your orders in a calendar format
- Click any day to edit that day's orders
- Visual indicators show order status

### Import from WhatsApp
- Export your tiffin group chat (WhatsApp > More > Export Chat > Without Media)
- Paste the text into the Parser
- Tiffinly will extract all your messages and auto-detect orders
- Review and save to your log

### Reports
- View your monthly spending
- Toggle payment status (Paid/Unpaid)
- See meal breakdown (Breakfast/Lunch/Dinner)
- Share your summary with others

## Project Structure

```
src/
├── pages/           # Page components
│   ├── Home.jsx
│   ├── Calendar.jsx
│   ├── Parser.jsx
│   ├── Reports.jsx
│   ├── Settings.jsx
│   └── Onboarding.jsx
├── components/      # Reusable components
│   ├── layout/      # Layout components (BottomNav, PageHeader)
│   └── ui/          # UI components (Toast, BottomSheet, Skeleton)
├── hooks/           # Custom React hooks
│   ├── useSettings.js
│   ├── useOrders.js
│   └── useMonthlyTotal.js
├── utils/           # Utility functions
│   ├── dateHelpers.js
│   └── waParser.js
├── db/              # Database schema
│   └── db.js
└── App.jsx          # Main app component
```

## Database Schema

### Orders
- `id` — Auto-increment
- `date` — YYYY-MM-DD
- `mealType` — 'breakfast' | 'lunch' | 'dinner'
- `ordered` — Boolean (true = ordered, false = skipped)
- `isHoliday` — Boolean
- `amount` — Meal price
- `source` — 'manual' | 'parser'

### Settings
- `id` — Always 1
- `serviceName` — Your tiffin service name
- `whatsappName` — Your name in the group
- `onboardingComplete` — Boolean
- `meals` — Object with breakfast/lunch/dinner config

### Payments
- `id` — Auto-increment
- `month` — YYYY-MM
- `amount` — Total for month
- `paid` — Boolean
- `paidDate` — Date paid (YYYY-MM-DD)

## Color Scheme

Primary (Orange/Coral):
- `#FF6B2C` — Main brand color
- `#FF8C52` — Light variant
- `#E55A1C` — Dark variant
- `#FFF4EE` — Lightest shade

Surfaces:
- White backgrounds for cards
- `#F7F7F5` — Secondary surface
- `#1C1C1E` — Dark mode surface

## PWA Installation

Tiffinly is a Progressive Web App and can be installed on any device:

- **iOS**: Open in Safari, tap Share > Add to Home Screen
- **Android**: Chrome menu > Install app
- **Desktop**: Browser menu > Install (or use chevron/plus icon)

Once installed, it works offline and feels like a native app.

## License

MIT

## Support

Having issues? Check:
1. Browser DevTools Console for error messages
2. Make sure your WhatsApp export is in the correct format
3. Verify meal prices are set to > 0
4. Try clearing browser cache and reloading

---

Made for tiffin lovers 🍱
