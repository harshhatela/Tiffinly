/**
 * Parses a WhatsApp group chat export and extracts tiffin orders
 * for a specific user and month.
 *
 * @param {string} rawText    - Full pasted WhatsApp export text
 * @param {string} userName   - User's display name in the group (partial, case-insensitive)
 * @param {string} month      - Target month as 'YYYY-MM'
 * @param {object} mealPrices - { breakfast: 50, lunch: 100, dinner: 80 }
 * @returns {Array}           - Deduplicated array of parsed order objects, sorted by date
 */
export function parseWhatsAppChat(rawText, userName, month, mealPrices) {
  // Handles both common WhatsApp export formats:
  // iOS:     "[DD/MM/YYYY, HH:MM:SS] Name: message"
  // Android: "DD/MM/YYYY, HH:MM - Name: message"
  const PATTERNS = [
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]\s*([^:]+):\s*(.+)$/i,
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)\s*-\s*([^:]+):\s*(.+)$/i,
  ];

  const POSITIVE = [
    'yes', 'y', 'haan', 'ha', 'ji', 'ok', 'okay',
    '✅', '👍', 'yep', 'sure', '1', 'yup', 'h', 'han',
  ];
  const NEGATIVE = [
    'no', 'n', 'nahi', 'nope', 'skip', 'band',
    '❌', '👎', 'mat', 'nah', '0', 'na', 'nai',
  ];

  const lines = rawText.split('\n');
  const results = [];
  const [targetYear, targetMonth] = month.split('-').map(Number);

  for (const line of lines) {
    let match = null;
    for (const pattern of PATTERNS) {
      match = line.match(pattern);
      if (match) break;
    }
    if (!match) continue;

    const [, dateStr, timeStr, sender, message] = match;

    // Filter by sender name (case-insensitive partial match)
    if (!sender.toLowerCase().includes(userName.toLowerCase().trim())) continue;

    // --- Parse date ---
    // Handles DD/MM/YYYY (Indian) and M/D/YY (US) formats
    const dateParts = dateStr.split('/').map(Number);
    let day, mon, year;

    if (dateParts[0] > 12) {
      // First part > 12 means it MUST be a day (DD/MM/YYYY)
      [day, mon, year] = dateParts;
    } else if (dateParts[1] > 12) {
      // Second part > 12 means it MUST be a day (M/D/YY)
      [mon, day, year] = dateParts;
    } else {
      // Ambiguous — default to Indian format (DD/MM/YYYY)
      [day, mon, year] = dateParts;
    }
    if (year < 100) year += 2000;

    // Filter to target month only
    if (year !== targetYear || mon !== targetMonth) continue;

    // --- Parse time → determine meal type by hour ---
    // Meal type is assigned from the TIME of the message,
    // not from keywords in the message content.
    let hours = 0;
    const timeLower = timeStr.toLowerCase();
    const isPM = timeLower.includes('pm');
    const isAM = timeLower.includes('am');
    const timeParts = timeStr.replace(/[apm\s]/gi, '').split(':').map(Number);
    hours = timeParts[0];
    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    const mealType =
      hours >= 5  && hours < 11 ? 'breakfast' :
      hours >= 11 && hours < 17 ? 'lunch'     :
      'dinner';

    // --- Detect order intent ---
    const msgNorm = message.toLowerCase().trim();

    // For short tokens (1-2 chars), require exact or boundary match to avoid
    // false positives (e.g. "y" inside "yummy" should not count)
    const matchToken = (token) => {
      if (token.length <= 2) {
        return (
          msgNorm === token ||
          msgNorm.startsWith(token + ' ') ||
          msgNorm.endsWith(' ' + token) ||
          new RegExp(`\\b${token}\\b`).test(msgNorm)
        );
      }
      return msgNorm.includes(token);
    };

    const isPositive = POSITIVE.some(matchToken);
    const isNegative = NEGATIVE.some(matchToken);

    // Skip ambiguous (both signals) and unintelligible (neither signal)
    if (isPositive === isNegative) continue;

    const dateFormatted = `${year}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const amount = isPositive ? (mealPrices[mealType] ?? 0) : 0;

    results.push({
      date:       dateFormatted,
      mealType,
      ordered:    isPositive,
      isHoliday:  false,
      amount,
      source:     'parser',
      rawMessage: message,
    });
  }

  // Deduplicate — same date+mealType keeps only the LAST entry
  // (handles cases where user first said "yes" then corrected to "no")
  const deduped = {};
  for (const r of results) {
    deduped[`${r.date}-${r.mealType}`] = r;
  }

  return Object.values(deduped)
    .filter(r => r.ordered)
    .sort((a, b) => a.date.localeCompare(b.date));
}
