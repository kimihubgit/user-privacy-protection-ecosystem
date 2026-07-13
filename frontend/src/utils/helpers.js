export function normalizeURL(rawURL) {
  let cleaned = rawURL.trim();
  if (!cleaned) return { url: '', domain: '' };

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'http://' + cleaned;
  }

  try {
    const u = new URL(cleaned);
    let host = u.host.toLowerCase();
    if (host.includes(':')) {
      const parts = host.split(':');
      if (parts[1] === '80' || parts[1] === '443') {
        host = parts[0];
      }
    }

    let domain = host;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }

    let path = u.pathname || '/';
    let normalized = `${u.protocol}//${host}${path}`;
    if (u.search) {
      normalized += u.search;
    }

    return { url: normalized, domain };
  } catch {
    let domain = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('?')[0];
    return { url: cleaned, domain };
  }
}

export function checkHeuristics(domain) {
  const brands = [
    'metamask', 'binance', 'paypal', 'vietcombank', 'momo', 'netflix', 'steam',
    'blockchain', 'apple', 'google', 'facebook', 'vnelid', 'techcombank', 'agribank',
    'bidv', 'vietinbank', 'trustwallet', 'coinbase', 'shopee', 'tiki', 'lazada'
  ];

  const scamKeywords = [
    'login', 'verify', 'account', 'wallet', 'support', 'security', 'signin',
    'update', 'gift', 'promo', 'claim', 'free', 'award', 'reward', 'jackpot',
    'checking', 'secure', 'otp', 'kichhoat', 'xacthuc', 'nhanqua', 'khuyenmai', 'trogiup'
  ];

  const domainLower = domain.toLowerCase();

  for (const brand of brands) {
    for (const kw of scamKeywords) {
      if (domainLower.includes(brand) && domainLower.includes(kw)) {
        return {
          status: 'malicious',
          category: 'phishing',
          description: `Phát hiện tự động (Heuristics): Tên miền chứa thương hiệu '${brand}' đi kèm từ khóa nghi vấn '${kw}'.`
        };
      }
    }

    if (domainLower.includes(`${brand}-`)) {
      return {
        status: 'suspicious',
        category: 'phishing',
        description: `Phát hiện tự động (Heuristics): Tên miền có dấu hiệu giả mạo thương hiệu '${brand}'.`
      };
    }
  }

  let kwCount = 0;
  const matchedKws = [];
  for (const kw of scamKeywords) {
    if (domainLower.includes(kw)) {
      kwCount++;
      matchedKws.push(kw);
    }
  }

  if (kwCount >= 2) {
    return {
      status: 'suspicious',
      category: 'scam',
      description: `Phát hiện tự động (Heuristics): Tên miền chứa nhiều từ khóa lừa đảo nhạy cảm: ${matchedKws.join(', ')}.`
    };
  }

  return null;
}

export function translateErrorMessage(msg) {
  if (!msg) return '';
  const msgLower = msg.toLowerCase().trim();
  
  if (msgLower === 'invalid username or password') {
    return 'Tên đăng nhập hoặc mật khẩu không chính xác!';
  }
  if (msgLower === 'username is required') {
    return 'Tên đăng nhập không được để trống!';
  }
  if (msgLower === 'password is required') {
    return 'Mật khẩu không được để trống!';
  }
  if (msgLower === 'email is required') {
    return 'Email không được để trống!';
  }
  if (msgLower.includes('username already') || msgLower.includes('tên đăng nhập đã tồn tại')) {
    return 'Tên đăng nhập đã tồn tại!';
  }
  if (msgLower.includes('email already') || msgLower.includes('email đã được đăng ký')) {
    return 'Địa chỉ email đã được đăng ký!';
  }
  if (msgLower.includes('passwords do not match')) {
    return 'Mật khẩu xác nhận không trùng khớp!';
  }
  if (msgLower.includes('email is invalid') || msgLower.includes('invalid email')) {
    return 'Địa chỉ email không hợp lệ!';
  }
  
  return msg;
}

export function getErrorMessage(errData, defaultMsg) {
  if (!errData) return defaultMsg;
  let rawMsg = defaultMsg;
  if (errData.error) {
    if (typeof errData.error === 'object') {
      rawMsg = errData.error.message || errData.error.code || defaultMsg;
    } else {
      rawMsg = errData.error;
    }
  } else if (errData.message) {
    rawMsg = errData.message;
  }
  return translateErrorMessage(rawMsg);
}
