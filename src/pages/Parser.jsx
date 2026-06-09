import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useSettings } from '../hooks/useSettings';
import { useOrders } from '../hooks/useOrders';
import { parseWhatsAppChat } from '../utils/waParser';
import { toYM, toYMD, formatCurrency } from '../utils/dateHelpers';
import { InfoIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Toast } from '../components/ui/Toast';

const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  return {
    label: d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }),
    value: toYM(d),
  };
});

const isAmbiguous = (msg) => {
  const POSITIVE = ['yes', 'haan', 'ha', 'ok', '✅', '👍'];
  const NEGATIVE = ['no', 'nahi', 'nope', '❌', '👎'];
  if (!msg) return false;
  const m = msg.toLowerCase();
  return POSITIVE.some(p => m.includes(p)) && NEGATIVE.some(n => m.includes(n));
};

export default function Parser() {
  const { settings } = useSettings();
  const { logOrder } = useOrders();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0].value);
  const [chatText, setChatText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showHowTo, setShowHowTo] = useState(false);

  const handleParse = () => {
    if (!chatText.trim()) {
      setToast({ message: 'Please paste a chat export', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const mealPrices = Object.keys(settings.meals).reduce((acc, meal) => {
        if (settings.meals[meal].enabled) {
          acc[meal] = settings.meals[meal].price;
        }
        return acc;
      }, {});

      const parsed = parseWhatsAppChat(chatText, settings.whatsappName, selectedMonth, mealPrices);
      setResults(parsed);
    } catch (err) {
      setToast({ message: 'Error parsing chat. Make sure format is correct.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      for (const order of results) {
        await logOrder(order);
      }
      setToast({
        message: `✓ ${results.length} orders imported for ${MONTHS.find(m => m.value === selectedMonth)?.label}`,
        type: 'success',
      });
      setChatText('');
      setResults(null);
    } catch (err) {
      setToast({ message: 'Error saving orders', type: 'error' });
    }
  };

  return (
    <div className="pb-24">
      <PageHeader title="Import from WhatsApp" subtitle="Bulk add orders" />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="p-4 space-y-6">
        {/* How-to card */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <button
            onClick={() => setShowHowTo(!showHowTo)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <InfoIcon size={20} className="text-primary" />
              <span className="font-medium text-gray-900">How to export</span>
            </div>
            {showHowTo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {showHowTo && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 text-sm text-gray-700 space-y-2">
              <p>1. Open your tiffin group in WhatsApp</p>
              <p>2. Tap ⋮ → More → Export Chat → Without Media</p>
              <p>3. Copy all the text and paste it below</p>
            </div>
          )}
        </div>

        {/* Month selector */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Select Month</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {MONTHS.map(m => (
              <button
                key={m.value}
                onClick={() => setSelectedMonth(m.value)}
                className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedMonth === m.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {!results ? (
          <>
            {/* Chat paste area */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Paste Chat Here</label>
              <textarea
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                placeholder="Paste your WhatsApp chat here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-2">
                {chatText.length} characters
              </p>
            </div>

            {/* Name confirmation */}
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              Searching for messages from: <span className="font-semibold">{settings.whatsappName}</span>
              <button
                onClick={() => window.alert('Edit name in Settings')}
                className="text-primary underline ml-2 text-xs"
              >
                Edit
              </button>
            </p>

            {/* Parse button */}
            <button
              onClick={handleParse}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-2xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Analysing...' : 'Analyse Chat ✦'}
            </button>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="bg-primary-50 border-2 border-primary rounded-2xl p-4">
              <p className="text-sm font-semibold text-primary">
                Found {results.length} order{results.length !== 1 ? 's' : ''} for{' '}
                {MONTHS.find(m => m.value === selectedMonth)?.label} · {formatCurrency(results.reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>

            {/* Results table */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Meal</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Message</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const d = new Date(r.date);
                      return (
                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">
                            {d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-lg">{settings.meals[r.mealType]?.emoji}</span>
                            {settings.meals[r.mealType]?.label}
                          </td>
                          <td className="px-4 py-3 text-gray-600 truncate text-xs">
                            {r.rawMessage?.substring(0, 30)}...
                            {isAmbiguous(r.rawMessage) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold
                                               text-amber-700 bg-amber-50 border border-amber-200
                                               px-2 py-0.5 rounded-full ml-1">
                                ⚠️ Review
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 font-medium">
                            {formatCurrency(r.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-primary text-white py-3 rounded-2xl font-semibold hover:bg-primary-600 transition-colors"
              >
                Save to Log
              </button>
              <button
                onClick={() => {
                  setResults(null);
                  setChatText('');
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
