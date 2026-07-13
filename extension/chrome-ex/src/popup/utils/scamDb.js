// Local scammer mockup database shared between App.vue and SearchTab.vue
export const scammerDatabase = {
  telegram: [
    { username: "kjhdkhsdf", id: "8119900362", reason: "Lừa cọc bán tài khoản game" }
  ],
  facebook: [
    { link: "facebook.com/nguyenvanA", name: "Nguyễn Văn A", id: "109876543210", reason: "Lừa cọc mua bán" }
  ],
  phone: [
    { number: "0901234567", name: "Nguyễn Văn A", reason: "Lừa đảo cọc mua hàng / Momo" }
  ],
  bank: [
    { account: "1012345678", bank: "Vietcombank", holder: "NGUYEN VAN A", reason: "Nhận tiền cọc lừa đảo" }
  ],
  email: [
    { address: "nguyenvana.crypto@gmail.com", reason: "Đăng ký Netflix lừa đảo" }
  ]
};

/**
 * Search scammer database for matches
 * @param {string} queryText 
 * @param {Function} t - i18n translation function
 * @returns {Array} matches
 */
export function searchScammer(queryText, t) {
  if (!queryText) return [];
  const results = [];
  const normalizedText = queryText.toLowerCase().trim();

  // Bank Accounts
  scammerDatabase.bank.forEach(b => {
    if (normalizedText.includes(b.account) || normalizedText.includes(b.holder.toLowerCase())) {
      results.push({
        type: t('search.type_bank'),
        value: `${b.bank} - ${b.account} (${b.holder})`,
        reason: b.reason
      });
    }
  });

  // Telegram Usernames
  scammerDatabase.telegram.forEach(tItem => {
    if (normalizedText.includes(tItem.username.toLowerCase()) || normalizedText.includes(tItem.id)) {
      results.push({
        type: t('search.type_telegram'),
        value: `@${tItem.username} (ID: ${tItem.id})`,
        reason: tItem.reason
      });
    }
  });

  // Phone numbers
  scammerDatabase.phone.forEach(p => {
    if (normalizedText.includes(p.number) || 
        (p.number.startsWith('0') && normalizedText.includes(p.number.substring(1))) || 
        normalizedText.includes(p.number.replace('+84', '0'))) {
      results.push({
        type: t('search.type_phone'),
        value: `${p.number} (${p.name})`,
        reason: p.reason
      });
    }
  });

  // Email
  scammerDatabase.email.forEach(e => {
    if (normalizedText.includes(e.address.toLowerCase())) {
      results.push({
        type: t('search.type_email'),
        value: e.address,
        reason: e.reason
      });
    }
  });

  // Facebook
  scammerDatabase.facebook.forEach(f => {
    if (normalizedText.includes(f.link.toLowerCase()) || normalizedText.includes(f.id)) {
      results.push({
        type: t('search.type_facebook'),
        value: `${f.name} (ID: ${f.id})`,
        reason: f.reason
      });
    }
  });

  return results;
}
