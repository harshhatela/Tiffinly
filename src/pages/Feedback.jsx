import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { UploadCloud, Share2, AlertCircle } from 'lucide-react';
import { Toast } from '../components/ui/Toast';

export default function Feedback() {
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [toast, setToast] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setScreenshot(file);
  };

  const generateMessage = () => {
    let msg = `*Tiffinly Feedback/Bug Report*\n\n`;
    msg += `Description: ${description}\n`;
    msg += `Version: 0.1.0\n`;
    msg += `Platform: ${navigator.platform}\n`;
    return msg;
  };

  const handleShare = async () => {
    if (!description.trim()) {
      setToast({ message: 'Please provide a description.', type: 'error' });
      return;
    }

    const text = generateMessage();

    try {
      if (navigator.share && screenshot) {
        const file = new File([screenshot], 'screenshot.jpg', { type: screenshot.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Tiffinly Feedback',
            text: text,
            files: [file],
          });
          setToast({ message: 'Thanks for your feedback!', type: 'success' });
          return;
        }
      }
      
      if (navigator.share) {
        await navigator.share({
          title: 'Tiffinly Feedback',
          text: text,
        });
        setToast({ message: 'Thanks for your feedback!', type: 'success' });
      } else {
        const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
        window.location.href = url;
        setToast({ message: 'Opening WhatsApp...', type: 'success' });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
        window.location.href = url;
      }
    }
  };

  return (
    <div className="pb-28">
      <PageHeader title="Report a Problem" subtitle="We're here to help" />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="p-4 space-y-6">
        <div className="bg-cream-100 shadow-neu rounded-3xl p-5">
          <label className="block text-sm font-bold text-gray-900 mb-2">What happened?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-cream-50 border-2 border-cream-200 rounded-2xl p-4 text-gray-900 focus:outline-none focus:border-primary min-h-[120px] transition-colors"
            placeholder="Describe the bug or feature request..."
          />
        </div>

        <div className="bg-cream-100 shadow-neu rounded-3xl p-5">
          <label className="block text-sm font-bold text-gray-900 mb-2">Attach a Screenshot (Optional)</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-cream-200 rounded-2xl bg-cream-50 cursor-pointer hover:bg-cream-100 transition-colors">
            {screenshot ? (
              <div className="text-center">
                <p className="font-bold text-primary text-sm">{screenshot.name}</p>
                <p className="text-xs text-gray-400 mt-1">Tap to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud size={24} className="text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-500">Tap to upload image</p>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        <button
          onClick={handleShare}
          className="btn-tactile w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-orange transition-transform flex items-center justify-center gap-2"
        >
          <Share2 size={20} />
          Send Feedback
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <AlertCircle size={14} />
          <p>Your device info will be included to help debugging.</p>
        </div>
      </div>
    </div>
  );
}
