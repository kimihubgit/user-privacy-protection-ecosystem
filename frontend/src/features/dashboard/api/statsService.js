import { MOCK_REVIEWS, MOCK_SCAM_URLS, MOCK_SCAMMERS } from '../../../lib/mockData';
import { API_CHECK_URL, API_AUTH_URL } from '../../../lib/config';

const API_BASE_URL = `${API_CHECK_URL}/api`;

export const statsService = {
  // GET /api/v1/admin/dashboard-stats
  async getAdminDashboardStats(token) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/dashboard-stats`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin thống kê dashboard!');
      }
      return await response.json();
    } catch (e) {
      console.error('getAdminDashboardStats failed:', e);
      throw e;
    }
  },
  // Get Reviews (Local mock helper)
  getReviews(domain) {
    return MOCK_REVIEWS[domain.toLowerCase()] || [];
  },

  // Get Scam List (mock pagination helper)
  getScamList(page = 1, limit = 10, type = 'all', searchQuery = '') {
    let list = [...MOCK_SCAM_URLS.map(item => ({ ...item, type: 'website' })), ...MOCK_SCAMMERS.map(item => ({ ...item, url: item.target, type: item.type === 'phone' ? 'phone' : 'bank' }))];

    if (type !== 'all') {
      list = list.filter(item => item.type === type);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        (item.url && item.url.toLowerCase().includes(q)) ||
        (item.domain && item.domain.toLowerCase().includes(q)) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = list.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      total,
      page,
      limit
    };
  },

  // Get Stats (Mock & live helper)
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // ignore
    }

    // Default beautiful mock stats
    return {
      totalChecks: 142903,
      maliciousUrlsCount: MOCK_SCAM_URLS.length + 8431,
      scamBankAccountsCount: MOCK_SCAMMERS.filter(s => s.type === 'bank_account').length + 1542,
      scamPhonesCount: MOCK_SCAMMERS.filter(s => s.type === 'phone').length + 2911,
      liveAlerts: [
        { id: 'a1', type: 'website', target: 'vietcombank-security-otp.xyz', time: 'Vừa xong', detail: 'Giả mạo ngân hàng' },
        { id: 'a2', type: 'bank', target: '19036729384920 (Techcombank)', time: '3 phút trước', detail: 'Lừa cọc vé máy bay' },
        { id: 'a3', type: 'phone', target: '0392817456', time: '8 phút trước', detail: 'Giả danh tòa án' },
        { id: 'a4', type: 'website', target: 'momo-nhanloc-he2026.net', time: '12 phút trước', detail: 'Lừa nhận thưởng MoMo' },
        { id: 'a5', type: 'bank', target: '048293849102 (Vietcombank)', time: '20 phút trước', detail: 'Giả mạo người thân chuyển khoản' },
      ]
    };
  }
};
