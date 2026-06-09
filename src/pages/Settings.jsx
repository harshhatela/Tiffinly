import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { useSettings } from '../hooks/useSettings';
import { db } from '../db/db';
import { Trash2 } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, saveSettings, loading } = useSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const handleServiceNameChange = e => {
    saveSettings({ serviceName: e.target.value });
  };

  const handleWhatsAppNameChange = e => {
    saveSettings({ whatsappName: e.target.value });
  };

  const handleMealToggle = mealType => {
    const isCurrentlyEnabled = settings.meals[mealType].enabled;

    // Guard: at least one meal must always remain enabled
    if (isCurrentlyEnabled) {
      const enabledCount = Object.values(settings.meals).filter(m => m.enabled).length;
      if (enabledCount <= 1) {
        alert('At least one meal type must be enabled.');
        return;
      }
    }

    saveSettings({
      meals: {
        ...settings.meals,
        [mealType]: {
          ...settings.meals[mealType],
          enabled: !isCurrentlyEnabled,
        },
      },
    });
  };

  const handleMealPriceChange = (mealType, price) => {
    saveSettings({
      meals: {
        ...settings.meals,
        [mealType]: {
          ...settings.meals[mealType],
          price: parseInt(price) || 0,
        },
      },
    });
  };

  const handleClearAllData = async () => {
    if (window.confirm('This will delete all your orders and settings permanently. Are you sure?')) {
      try {
        await db.orders.clear();
        await db.payments.clear();
        await db.settings.clear();
        alert('All data cleared. Please restart the app.');
        navigate('/');
        // Force a full reload so onboarding triggers fresh
        window.location.reload();
      } catch (err) {
        console.error('Failed to clear data:', err);
        alert('Something went wrong clearing data. Please try again.');
      }
    }
  };

  return (
    <div className="pb-24">
      <PageHeader title="Settings" subtitle="Customize your experience" />

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-cream-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-3xl font-extrabold shadow-orange">
              {settings.serviceName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold text-gray-900 truncate">{settings.serviceName}</h2>
              <p className="text-sm font-medium text-gray-500 mt-0.5">Tiffin Service</p>
            </div>
            <button
              onClick={() => {
                const newName = prompt('Enter new service name:', settings.serviceName);
                if (newName && newName.trim()) {
                  saveSettings({ ...settings, serviceName: newName.trim() });
                }
              }}
              className="w-10 h-10 rounded-xl bg-cream-100 text-gray-500 flex items-center justify-center active:scale-[0.965] transition-transform"
            >
              <PenLine size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-cream-200">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your WhatsApp Name</label>
            <input
              type="text"
              value={settings.whatsappName}
              onChange={handleWhatsAppNameChange}
              placeholder="e.g. Rahul"
              className="w-full bg-cream-50 border-2 border-cream-200 rounded-2xl px-5 py-3.5 font-bold text-lg text-gray-900 focus:border-primary focus:outline-none focus:bg-white transition-colors"
            />
            <p className="text-xs font-medium text-gray-400 mt-3">Used to match imported orders.</p>
        </div>

        {/* Meals Configuration */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Meal Settings</h3>
          {Object.keys(settings.meals).map(meal => {
            const mealInfo = settings.meals[meal];
            const isMealEnabled = mealInfo.enabled;
            
            const mealColors = {
              breakfast: { bg: 'bg-breakfast-bg' },
              lunch: { bg: 'bg-lunch-bg' },
              dinner: { bg: 'bg-dinner-bg' }
            };
            const bgClass = mealColors[meal]?.bg || 'bg-lunch-bg';

            return (
              <div key={meal} className="bg-white rounded-3xl p-4 shadow-soft border border-cream-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-colors ${isMealEnabled ? bgClass : 'bg-cream-100 grayscale opacity-50'}`}>
                      {mealInfo.emoji}
                    </div>
                    <div>
                      <p className={`font-bold text-base capitalize transition-colors ${isMealEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                        {mealInfo.label || meal}
                      </p>
                      {isMealEnabled && (
                        <p className="text-sm font-medium text-gray-500">₹{mealInfo.price} per meal</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleMealToggle(meal)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isMealEnabled ? 'bg-primary' : 'bg-cream-300'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      isMealEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {isMealEnabled && (
                  <div className="mt-4 pt-4 border-t border-cream-200 animate-slideDown">
                    <button
                      onClick={() => {
                        const newPrice = prompt(`Enter new price for ${mealInfo.label || meal}:`, mealInfo.price);
                        if (newPrice !== null && !isNaN(newPrice)) {
                          handleMealPriceChange(meal, newPrice);
                        }
                      }}
                      className="w-full py-2.5 rounded-2xl bg-cream-50 text-gray-700 font-bold text-sm border border-cream-200 active:scale-[0.965] transition-transform"
                    >
                      Edit Price
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Danger zone */}
        <div className="space-y-3 pt-4 border-t border-cream-200">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest px-1">Danger Zone</h3>
          <button
            onClick={handleClearAllData}
            className="w-full bg-red-50 rounded-2xl px-5 py-4 flex items-center gap-3 text-red-600 font-bold border border-red-100 active:scale-[0.965] transition-transform"
          >
            <Trash2 size={20} className="text-red-400" />
            Clear All Data
          </button>
        </div>

        {/* App info */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Made for tiffin lovers 🍱</p>
          <p>Version 0.1.0</p>
        </div>
      </div>
    </div>
  );
}
