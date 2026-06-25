import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { db } from '../db/db';
import { supabase } from '../lib/supabase';

export default function Account() {
  const { user, signUp, signIn, signOut, cloudEnabled } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]   = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);
  
  const [showMigratePrompt, setShowMigratePrompt] = useState(false);
  const [localOrders, setLocalOrders] = useState([]);
  const [localSettings, setLocalSettings] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const action = mode === 'signin' ? signIn : signUp;
    const { error: authError } = await action(email, password);
    setBusy(false);
    if (authError) { setError(authError.message); return; }
    if (mode === 'signup') {
      setError(''); // show "check your email" message instead via a separate state if desired
    }
    
    // Check for migration
    const localOrdersData   = await db.orders.toArray();
    const localSettingsData = await db.settings.get(1);

    if (localOrdersData.length > 0 || localSettingsData?.onboardingComplete) {
      setLocalOrders(localOrdersData);
      setLocalSettings(localSettingsData);
      setShowMigratePrompt(true); // render a confirm dialog
    } else {
      navigate('/settings');
    }
  };

  const handleMigrate = async () => {
    setBusy(true);
    try {
      if (localSettings) {
        await supabase.from('profiles').update({
          service_name:  localSettings.serviceName,
          whatsapp_name:  localSettings.whatsappName,
          meals:          localSettings.meals,
        }).eq('id', user?.id || (await supabase.auth.getUser()).data.user.id);
      }
      if (localOrders.length > 0) {
        const uid = user?.id || (await supabase.auth.getUser()).data.user.id;
        const rows = localOrders.map(o => ({
          user_id: uid, date: o.date, meal_type: o.mealType,
          ordered: o.ordered, is_holiday: o.isHoliday,
          amount: o.amount, source: o.source,
        }));
        await supabase.from('orders').upsert(rows, { onConflict: 'user_id,date,meal_type' });
      }
      navigate('/settings');
    } catch (err) {
      console.error(err);
      setError('Migration failed. You can try again later.');
    } finally {
      setBusy(false);
    }
  };

  if (!cloudEnabled) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-[#0C0C0F] flex items-center
                      justify-center p-8 text-center">
        <p className="font-sans text-gray-400">
          Cloud sync isn't configured for this build. Your data stays on this device.
        </p>
      </div>
    );
  }

  if (showMigratePrompt) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-[#0C0C0F]">
        <PageHeader title="Account Setup" />
        <div className="px-4">
          <div className="bg-white dark:bg-[#17171B] shadow-neu rounded-3xl p-5 mb-4">
            <p className="font-display font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
              Existing Data Found
            </p>
            <p className="font-sans text-sm text-gray-500 dark:text-gray-400 mb-6">
              We found existing tiffin data on this device. Would you like to import it into your new account to sync across devices?
            </p>
            <button onClick={handleMigrate} disabled={busy}
              className="btn-tactile w-full py-3.5 rounded-2xl bg-primary text-white
                         font-sans font-bold text-sm shadow-orange disabled:opacity-60 mb-3">
              {busy ? 'Importing...' : 'Import to Cloud'}
            </button>
            <button onClick={() => navigate('/settings')} disabled={busy}
              className="btn-tactile w-full py-3.5 rounded-2xl bg-cream-100 dark:bg-[#1F1F25]
                         text-gray-600 dark:text-gray-300 font-sans font-bold text-sm disabled:opacity-60">
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-[#0C0C0F]">
        <PageHeader title="Account" subtitle={user.email} />
        <div className="px-4">
          <div className="bg-white dark:bg-[#17171B] shadow-neu rounded-3xl p-5 mb-4">
            <p className="font-display font-bold text-base text-gray-900 dark:text-gray-100">
              Signed in
            </p>
            <p className="font-sans text-sm text-gray-400 mt-1">{user.email}</p>
            <p className="font-sans text-xs text-green-600 dark:text-green-400 mt-2">
              ✓ Your data syncs across all your devices
            </p>
          </div>
          <button
            onClick={signOut}
            className="btn-tactile w-full py-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10
                       text-red-600 dark:text-red-400 font-sans font-bold text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-[#0C0C0F]">
      <PageHeader title="Account" subtitle="Sync your tiffin data" />
      <div className="px-4">
        <div className="bg-white dark:bg-[#17171B] shadow-neu rounded-3xl p-5 mb-4">
          <p className="font-sans text-sm text-gray-500 dark:text-gray-400 mb-4">
            Create an account to sync your orders across phone, laptop, and
            any browser. Your data stays local if you skip this.
          </p>

          <div className="flex bg-cream-100 dark:bg-[#0C0C0F] rounded-2xl p-1.5 gap-1.5 mb-4">
            {['signin', 'signup'].map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold font-sans transition-all
                  ${mode === m ? 'bg-primary text-white' : 'text-gray-400'}`}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email" required placeholder="Email"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-cream-50 dark:bg-[#111114] border border-cream-200
                         dark:border-[#26262E] rounded-2xl px-4 py-3 font-sans text-sm
                         text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none"
            />
            <input
              type="password" required minLength={6} placeholder="Password (min 6 characters)"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-cream-50 dark:bg-[#111114] border border-cream-200
                         dark:border-[#26262E] rounded-2xl px-4 py-3 font-sans text-sm
                         text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none"
            />
            {error && <p className="text-red-500 text-xs font-sans">{error}</p>}
            <button type="submit" disabled={busy}
              className="btn-tactile w-full py-3.5 rounded-2xl bg-primary text-white
                         font-sans font-bold text-sm shadow-orange disabled:opacity-60">
              {busy ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
