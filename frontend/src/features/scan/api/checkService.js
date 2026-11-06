import { MOCK_SCAM_URLS, MOCK_SCAMMERS } from '../../../lib/mockData';
import { normalizeURL, checkHeuristics } from '../../../utils/helpers';
import { API_CHECK_URL } from '../../../lib/config';

const API_BASE_URL = `${API_CHECK_URL}/api`;

export const checkService = {
  // Check URL (Public)
  async checkURL(rawURL) {
    try {
      const response = await fetch(`${API_BASE_URL}/urls/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawURL })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      console.warn('Backend API connection failed, using local scanner heuristics.');
    }

    // Fallback Mock Logic
    const { url, domain } = normalizeURL(rawURL);
    if (!domain) {
      throw new Error('URL không hợp lệ');
    }

    // A. Check Whitelist
    const localWhitelist = JSON.parse(localStorage.getItem('admin_whitelist') || '[]');
    const isWhitelisted = localWhitelist.some(item => item.domain.toLowerCase() === domain.toLowerCase());
    if (isWhitelisted) {
      return {
        url,
        domain,
        status: 'safe',
        category: 'safe_whitelist',
        description: 'Tên miền này đã được xác minh chính thống và thuộc danh sách an toàn (Whitelist).',
        isSafe: true,
        source: 'whitelist'
      };
    }

    // B. Check local admin blacklist
    const localBlacklist = JSON.parse(localStorage.getItem('admin_blacklist') || '[]');
    const localMatch = localBlacklist.find(item =>
      item.type === 'url' &&
      (item.target.toLowerCase() === url.toLowerCase() ||
        item.target.toLowerCase() === domain.toLowerCase())
    );

    if (localMatch) {
      return {
        url,
        domain,
        status: localMatch.severity || 'malicious',
        category: localMatch.category || 'phishing',
        description: localMatch.description,
        isSafe: false,
        source: 'local_database'
      };
    }

    // 1. Exact or base domain match in mock DB
    const dbMatch = MOCK_SCAM_URLS.find(item =>
      item.url.toLowerCase() === url.toLowerCase() ||
      item.domain.toLowerCase() === domain.toLowerCase()
    );

    if (dbMatch) {
      return {
        url,
        domain,
        status: dbMatch.status,
        category: dbMatch.category,
        description: dbMatch.description,
        isSafe: dbMatch.status === 'safe',
        source: 'local_database'
      };
    }

    // 2. Check heuristics
    const heuristicMatch = checkHeuristics(domain);
    if (heuristicMatch) {
      return {
        url,
        domain,
        status: heuristicMatch.status,
        category: heuristicMatch.category,
        description: heuristicMatch.description,
        isSafe: false,
        source: 'heuristics'
      };
    }

    // 3. Default Unverified Response (Not in Blacklist, but Not in Whitelist)
    return {
      url,
      domain,
      status: 'unverified',
      category: 'none',
      description: 'Chưa ghi nhận vi phạm trong cơ sở dữ liệu. Tuy nhiên, tên miền này chưa thuộc danh sách xác minh an toàn (Whitelist), quý khách nên cẩn trọng khi giao dịch.',
      isSafe: false,
      isUnverified: true,
      source: 'system'
    };
  },

  // Check Scammer Account/Phone (Public)
  async checkScammer(target) {
    const cleanedTarget = target.trim().replace(/\s+/g, '');
    try {
      const response = await fetch(`${API_BASE_URL}/scammers/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: cleanedTarget })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      console.warn('Backend API connection failed, using local scammer DB.');
    }

    // Fallback Mock Logic
    const localBlacklist = JSON.parse(localStorage.getItem('admin_blacklist') || '[]');
    const localMatch = localBlacklist.find(item =>
      item.type !== 'url' && item.target === cleanedTarget
    );

    if (localMatch) {
      return {
        target: cleanedTarget,
        status: 'malicious',
        data: {
          id: localMatch.id,
          target: localMatch.target,
          type: localMatch.type,
          name: localMatch.type === 'bank_account' ? 'ĐỐI TƯỢNG LỪA ĐẢO' : 'Mẹo dụ dỗ',
          bankName: localMatch.bankName || '',
          description: localMatch.description,
          reportsCount: 1,
          status: 'approved'
        }
      };
    }

    const match = MOCK_SCAMMERS.find(s => s.target === cleanedTarget);
    if (match) {
      return {
        target: cleanedTarget,
        status: 'malicious',
        data: match
      };
    }

    return {
      target: cleanedTarget,
      status: 'safe',
      message: 'Không tìm thấy thông tin trùng khớp với đối tượng lừa đảo trong cơ sở dữ liệu.'
    };
  },

  // Check Email Breach (Public)
  async checkEmailBreach(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/check-breach/email?q=${encodeURIComponent(email)}&lang=vi`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Backend API checkEmailBreach failed:', e);
    }
    return null;
  },

  // Get search suggestions (Public)
  async getSuggestions(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Backend API getSuggestions failed:', e);
    }
    return null;
  },

  // Get check detail (Public)
  async getDetail(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ target: query })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Backend API getDetail failed:', e);
    }
    return null;
  }
};
