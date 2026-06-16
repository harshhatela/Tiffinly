import { db } from '../db/db';

/**
 * Exports all data from Dexie as a downloadable JSON file.
 */
export async function exportBackup() {
  const [orders, settings, payments] = await Promise.all([
    db.orders.toArray(),
    db.settings.toArray(),
    db.payments.toArray(),
  ]);

  const backup = {
    version:   1,
    exportedAt: new Date().toISOString(),
    appName:   'Tiffinly',
    data: { orders, settings, payments },
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `tiffinly-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports a Tiffinly backup JSON file.
 * Returns { success, ordersImported, error }
 */
export async function importBackup(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const raw    = JSON.parse(e.target.result);

        // Validate it's a Tiffinly backup
        if (raw.appName !== 'Tiffinly' || !raw.data) {
          resolve({ success: false, error: 'Invalid backup file.' });
          return;
        }

        const { orders = [], settings = [], payments = [] } = raw.data;

        // Clear existing and reimport
        await db.transaction('rw', db.orders, db.settings, db.payments, async () => {
          await db.orders.clear();
          await db.settings.clear();
          await db.payments.clear();
          if (orders.length)   await db.orders.bulkAdd(orders.map(({ id, ...rest }) => rest));
          if (settings.length) await db.settings.bulkAdd(settings.map(({ id, ...rest }) => rest));
          if (payments.length) await db.payments.bulkAdd(payments.map(({ id, ...rest }) => rest));
        });

        resolve({ success: true, ordersImported: orders.length });
      } catch (err) {
        resolve({ success: false, error: 'Could not read backup file. Is it a valid Tiffinly export?' });
      }
    };

    reader.onerror = () => resolve({ success: false, error: 'File read failed.' });
    reader.readAsText(file);
  });
}
