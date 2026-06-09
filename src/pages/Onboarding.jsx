import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const steps = [
  'Welcome',
  'Service Name',
  'Meal Types',
  'Meal Prices',
  'WhatsApp Name',
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    serviceName: '',
    whatsappName: '',
    meals: {
      breakfast: { enabled: false, price: 0 },
      lunch: { enabled: true, price: 100 },
      dinner: { enabled: true, price: 80 },
    },
  });

  const { saveSettings } = useSettings();

  const handleNext = async () => {
    if (step === steps.length - 1) {
      // Save to settings
      await saveSettings({
        ...formData,
        onboardingComplete: true,
        meals: {
          breakfast: { ...formData.meals.breakfast, emoji: '🌅', label: 'Breakfast' },
          lunch: { ...formData.meals.lunch, emoji: '🍱', label: 'Lunch' },
          dinner: { ...formData.meals.dinner, emoji: '🌙', label: 'Dinner' },
        },
      });
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleMeal = (mealType) => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: {
          ...prev.meals[mealType],
          enabled: !prev.meals[mealType].enabled,
        },
      },
    }));
  };

  const updateMealPrice = (mealType, price) => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: {
          ...prev.meals[mealType],
          price: parseInt(price) || 0,
        },
      },
    }));
  };

  const enabledMeals = Object.keys(formData.meals).filter(
    meal => formData.meals[meal].enabled
  );
  const isStepValid = () => {
    if (step === 1) return formData.serviceName.trim().length > 0;
    if (step === 2) return enabledMeals.length > 0;
    if (step === 3) return enabledMeals.every(meal => formData.meals[meal].price > 0);
    if (step === 4) return formData.whatsappName.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-surface-secondary flex flex-col">
      {/* Progress dots */}
      <div className="flex gap-2 justify-center py-8">
        {steps.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300
            ${i === step
              ? 'w-6 bg-primary'     // active: elongated orange pill
              : 'w-2 bg-cream-200'   // inactive: small gray dot
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-20">
        <div className="bg-white rounded-4xl shadow-card p-6 w-full max-w-sm mx-auto">
          {step === 0 && <StepWelcome />}
          {step === 1 && (
            <StepServiceName
              value={formData.serviceName}
              onChange={e => updateField('serviceName', e.target.value)}
            />
          )}
          {step === 2 && (
            <StepMealTypes
              meals={formData.meals}
              onToggle={toggleMeal}
            />
          )}
          {step === 3 && (
            <StepMealPrices
              meals={formData.meals}
              onUpdate={updateMealPrice}
            />
          )}
          {step === 4 && (
            <StepWhatsAppName
              value={formData.whatsappName}
              onChange={e => updateField('whatsappName', e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Navigation — floating pill bar */}
      <div className="fixed bottom-4 left-4 right-4 max-w-[398px] mx-auto">
        <div className="glass rounded-3xl p-3 shadow-float flex gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-4 rounded-2xl border-2 border-cream-200 text-gray-700 font-bold active:scale-[0.97] transition-transform duration-100"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex-[2] py-4 rounded-2xl font-bold text-white text-base shadow-orange active:scale-[0.97] transition-transform duration-100 flex items-center justify-center gap-2 ${
              isStepValid()
                ? 'bg-primary'
                : 'bg-cream-300 cursor-not-allowed shadow-none'
            }`}
          >
            {step === steps.length - 1 ? '🎉 Let\'s Go!' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StepWelcome() {
  return (
    <div className="text-center animate-fadeInUp">
      <div className="flex flex-col items-center gap-4 mb-8">
        <img
          src="/icon.png"
          alt="Tiffinly icon"
          className="w-24 h-24 rounded-4xl shadow-lifted"
        />
        <img
          src="/logo.png"
          alt="Tiffinly"
          className="h-10 object-contain"
        />
      </div>
      <p className="text-lg text-gray-600 mb-3 font-medium leading-relaxed">
        Track your tiffin.<br/>Pay exactly right.
      </p>
      <p className="text-sm text-gray-400">Never wonder how much you owe again ✨</p>
    </div>
  );
}

function StepServiceName({ value, onChange }) {
  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">What's your tiffin service called?</h2>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="e.g. Sharma Tiffin, Maa ka Khana"
        className="w-full bg-cream-50 border-2 border-cream-200 rounded-2xl px-5 py-4 font-bold text-lg text-gray-900 focus:border-primary focus:outline-none focus:bg-white transition-colors"
        autoFocus
      />
    </div>
  );
}

function StepMealTypes({ meals, onToggle }) {
  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Which meals do you subscribe to?</h2>
      <div className="flex gap-3">
        {Object.keys(meals).map(mealType => {
          const mealEmoji = mealType === 'breakfast' ? '🌅' : mealType === 'lunch' ? '🍱' : '🌙';
          const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);
          return meals[mealType].enabled ? (
            <button
              key={mealType}
              onClick={() => onToggle(mealType)}
              className="flex-1 flex flex-col items-center gap-2 py-5 rounded-3xl bg-primary-100 border-2 border-primary shadow-soft active:scale-[0.965] transition-transform"
            >
              <span className="text-3xl">{mealEmoji}</span>
              <span className="font-bold text-sm text-primary">{mealLabel}</span>
            </button>
          ) : (
            <button
              key={mealType}
              onClick={() => onToggle(mealType)}
              className="flex-1 flex flex-col items-center gap-2 py-5 rounded-3xl bg-cream-50 border-2 border-cream-200 active:scale-[0.965] transition-transform"
            >
              <span className="text-3xl opacity-50">{mealEmoji}</span>
              <span className="font-semibold text-sm text-gray-400">{mealLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepMealPrices({ meals, onUpdate }) {
  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">How much per meal?</h2>
      <p className="text-sm text-gray-500 mb-6">You can change this later in settings.</p>
      <div className="space-y-3">
        {Object.keys(meals)
          .filter(meal => meals[meal].enabled)
          .map(meal => (
            <div key={meal}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {meals[meal].emoji} {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">₹</span>
                <input
                  type="number"
                  value={meals[meal].price}
                  onChange={e => onUpdate(meal, e.target.value)}
                  className="w-full bg-cream-50 border-2 border-cream-200 rounded-2xl pl-9 pr-4 py-3.5 font-bold text-lg text-gray-900 focus:border-primary focus:outline-none focus:bg-white transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function StepWhatsAppName({ value, onChange }) {
  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your name in the tiffin group</h2>
      <p className="text-sm text-gray-500 mb-6">
        This is how Tiffinly finds your messages when you import a chat.
      </p>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="e.g. Rahul, Arjun 📚"
        className="w-full bg-cream-50 border-2 border-cream-200 rounded-2xl px-5 py-4 font-bold text-lg text-gray-900 focus:border-primary focus:outline-none focus:bg-white transition-colors"
        autoFocus
      />
    </div>
  );
}
