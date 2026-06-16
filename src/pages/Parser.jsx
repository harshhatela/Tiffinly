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
  const { settings, loading: settingsLoading } = useSettings();
  const { logOrder } = useOrders();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0].value);
  const [chatText, setChatText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showHowTo, setShowHowTo] = useState(false);

  // Image import state
  const [activeTab,   setActiveTab]   = useState('text');
  const [imageFile,   setImageFile]   = useState(null);
  const [previewUrl,  setPreviewUrl]  = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [parseError,  setParseError]  = useState(null);

  if (settingsLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 font-medium animate-pulse">Loading...</div>
      </div>
    );
  }

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image too large. Max 5MB.', type: 'error' });
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setParseError(null);
  };

  const handleImageAnalyse = async () => {
    if (!imageFile || !settings?.whatsappName) return;
    setIsAnalysing(true);
    setParseError(null);

    try {
      // Convert image to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const mediaType = imageFile.type;

      // Call Anthropic API with vision
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 },
              },
              {
                type: 'text',
                text: `This is a screenshot of a WhatsApp group chat for a tiffin (meal delivery) service.

Extract all messages sent by the person named "${settings.whatsappName}" for the month ${selectedMonth}.

For each message, determine:
1. The date (format: YYYY-MM-DD)
2. The time (24-hour format)
3. Whether the message means they want to ORDER ("yes", "haan", "ha", "ok", "✅", "👍") or SKIP ("no", "nahi", "nope", "❌", "👎")
4. Meal type based on time: 5:00-10:59 = breakfast, 11:00-16:59 = lunch, 17:00-23:59 = dinner

Respond ONLY with a JSON array. No explanation, no markdown, no preamble:
[
  {
    "date": "YYYY-MM-DD",
    "mealType": "lunch",
    "ordered": true,
    "rawMessage": "original message text"
  }
]

If no messages from "${settings.whatsappName}" are visible, return: []`
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const raw = data.content?.find(b => b.type === 'text')?.text ?? '[]';

      // Strip any markdown fences if present
      const clean = raw.replace(/```json|```/g, '').trim();
      const extracted = JSON.parse(clean);

      if (!Array.isArray(extracted)) throw new Error('Unexpected response format');

      // Map to the same shape as the text parser output
      const mealPrices = {
        breakfast: settings.meals.breakfast?.price ?? 0,
        lunch:     settings.meals.lunch?.price ?? 0,
        dinner:    settings.meals.dinner?.price ?? 0,
      };

      const mappedResults = extracted.map(item => ({
        date:       item.date,
        mealType:   item.mealType,
        ordered:    item.ordered,
        isHoliday:  false,
        amount:     item.ordered ? (mealPrices[item.mealType] ?? 0) : 0,
        source:     'image-parser',
        rawMessage: item.rawMessage ?? '',
      }));

      // Deduplicate
      const deduped = {};
      for (const r of mappedResults) {
        deduped[`${r.date}-${r.mealType}`] = r;
      }

      const finalResults = Object.values(deduped).sort((a, b) => a.date.localeCompare(b.date));
      setResults(finalResults);

      if (finalResults.length === 0) {
        setParseError(`No messages from "${settings.whatsappName}" found in this screenshot.`);
      }

    } catch (err) {
      console.error('Image analysis failed:', err);
      setParseError(
        err.message.includes('API error')
          ? 'Analysis failed. Check your connection and try again.'
          : 'Could not read this image. Try a clearer screenshot.'
      );
    } finally {
      setIsAnalysing(false);
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
      setImageFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setToast({ message: 'Error saving orders', type: 'error' });
    }
  };

  return (
    <div className="pb-24">
      <PageHeader title="Import from WhatsApp" subtitle="Bulk add orders" />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="p-4 space-y-6">
        {/* Tab Switcher */}
        <div className="flex bg-cream-100 shadow-neu-inset rounded-2xl p-1 gap-1 mb-4">
          {[
            { key: 'text',  label: '📋 Paste Text' },
            { key: 'image', label: '📸 Image'      },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setResults(null); setParseError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
                ${activeTab === tab.key
                  ? 'bg-white shadow-soft text-primary'
                  : 'text-gray-400'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* How-to card */}
        <div className="bg-cream-100 shadow-neu rounded-3xl mb-4 overflow-hidden">
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
              <p>3. {activeTab === 'text' ? 'Copy all the text and paste it below' : 'Take a screenshot and upload it below'}</p>
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
            {/* ===== TEXT TAB ===== */}
            {activeTab === 'text' && (
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
            )}

            {/* ===== IMAGE TAB ===== */}
            {activeTab === 'image' && (
              <div className="flex flex-col items-center gap-4">
                {/* Upload area */}
                <label
                  htmlFor="chat-image-upload"
                  className="w-full min-h-[180px] rounded-3xl border-2 border-dashed border-cream-300
                             bg-cream-50 flex flex-col items-center justify-center gap-3
                             cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <span className="text-4xl">📸</span>
                  <div className="text-center">
                    <p className="font-bold text-sm text-gray-700">Tap to upload chat screenshot</p>
                    <p className="font-medium text-xs text-gray-400 mt-1">
                      JPG, PNG, or WebP · Max 5MB
                    </p>
                  </div>
                  <input
                    id="chat-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                {/* Preview */}
                {previewUrl && (
                  <div className="relative w-full">
                    <img
                      src={previewUrl}
                      alt="Chat screenshot preview"
                      className="w-full rounded-2xl shadow-neu object-contain max-h-64"
                    />
                    <button
                      onClick={() => { setPreviewUrl(null); setImageFile(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50
                                 text-white text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Analyse button */}
                {imageFile && (
                  <button
                    onClick={handleImageAnalyse}
                    disabled={isAnalysing}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-bold
                               shadow-orange active:scale-[0.97] transition-transform
                               disabled:opacity-60"
                  >
                    {isAnalysing ? 'Analysing image...' : 'Analyse Image ✦'}
                  </button>
                )}

                {/* Error message */}
                {parseError && (
                  <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-600 font-medium">
                    {parseError}
                  </div>
                )}
              </div>
            )}
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
            <div className="bg-cream-100 shadow-neu rounded-3xl mb-4 overflow-hidden">
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
                  setImageFile(null);
                  setPreviewUrl(null);
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
