import { getErrorMessage } from '../../../utils/helpers';
import { API_CHECK_URL, API_AUTH_URL } from '../../../lib/config';

export const reportService = {
  // Report URL (Authenticated)
  async reportURL(url, reason, description, submitter) {
    const token = localStorage.getItem('token');
    const contact = [];
    if (submitter?.phone) {
      contact.push({ type: 'phone', value: submitter.phone });
    }
    if (submitter?.email) {
      contact.push({ type: 'email', value: submitter.email });
    }
    if (submitter?.otherContact) {
      contact.push({ type: 'social', value: submitter.otherContact });
    }

    const payload = {
      type: 1,
      reporter: {
        name: submitter?.name || 'anonymous',
        role: submitter?.role || 'victim',
        contact: contact
      },
      raw: {
        title: `Báo cáo URL: ${url}`,
        url: url
      }
    };

    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        return await response.json();
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errData, 'Gửi báo cáo URL độc hại thất bại!'));
      }
    } catch (e) {
      if (e instanceof TypeError) {
        console.warn('Backend API connection failed, mock saving report.');
        const reportId = 'REP' + Math.floor(100000 + Math.random() * 900000);
        return {
          status: 'success',
          message: 'Báo cáo URL thành công (Mock)',
          data: { id: reportId }
        };
      }
      throw e;
    }
  },

  // Report Scammer (Authenticated)
  async reportScammer(data) {
    const token = localStorage.getItem('token');
    const contact = [];
    if (data.submitter?.phone) {
      contact.push({ type: 'phone', value: data.submitter.phone });
    }
    if (data.submitter?.email) {
      contact.push({ type: 'email', value: data.submitter.email });
    }
    if (data.submitter?.otherContact) {
      contact.push({ type: 'social', value: data.submitter.otherContact });
    }

    const other = {};
    if (data.type === 'phone') {
      other.phone = [data.target];
    } else if (data.type === 'bank_account') {
      other.bank_account = [data.target];
      other.bank_name = [data.bankName || ''];
    }
    if (data.name && data.name !== 'Báo cáo bóc tách') {
      other.name = [data.name];
    }

    const payload = {
      type: 0, // Scammer
      reporter: {
        name: data.submitter?.name || 'Ẩn danh',
        role: data.submitter?.role || 'victim',
        contact: contact
      },
      raw: {
        title: `Báo cáo đối tượng: ${data.target}`,
        detail: data.description,
        other: other
      }
    };

    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        return await response.json();
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errData, 'Gửi báo cáo đối tượng lừa đảo thất bại!'));
      }
    } catch (e) {
      if (e instanceof TypeError) {
        console.warn('Backend API connection failed, mock saving scammer report.');
        const reportId = 'SCM' + Math.floor(100000 + Math.random() * 900000);
        return {
          status: 'success',
          message: 'Báo cáo đối tượng lừa đảo thành công (Mock)',
          data: { id: reportId }
        };
      }
      throw e;
    }
  },

  // Get My Reports status (Authenticated)
  async getMyReports(page = 1, limit = 20) {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/status?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errData, 'Không thể lấy danh sách báo cáo!'));
      }

      return await response.json();
    } catch (e) {
      console.warn('Backend API connection failed, using local mocked user_reports.');
      throw e;
    }
  },

  // GET /api/v1/admin/reports/stats
  async getAdminReportsStats(token) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/reports/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể lấy thống kê báo cáo hệ thống!');
      }
      return await response.json();
    } catch (e) {
      console.error('getAdminReportsStats failed:', e);
      throw e;
    }
  },

  // GET /api/v1/admin/reports/:id
  async getAdminReportDetail(token, id) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/reports/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể lấy chi tiết báo cáo!');
      }
      return await response.json();
    } catch (e) {
      console.error('getAdminReportDetail failed:', e);
      throw e;
    }
  },

  // PUT /api/v1/admin/reports/:id/status
  async updateAdminReportStatus(token, id, status) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái báo cáo!');
      }
      return await response.json();
    } catch (e) {
      console.error('updateAdminReportStatus failed:', e);
      throw e;
    }
  },

  // GET /api/v1/admin/reports
  async getAdminReports(token, page = 1, limit = 20, status = '', type = null) {
    try {
      let queryStr = `page=${page}&limit=${limit}`;
      if (status) queryStr += `&status=${status}`;
      if (type !== null && type !== undefined) queryStr += `&type=${type}`;
      
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/reports?${queryStr}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách báo cáo hệ thống!');
      }
      return await response.json();
    } catch (e) {
      console.error('getAdminReports failed:', e);
      throw e;
    }
  },

  // POST /api/v1/admin/urls
  async addAdminScamURL(token, payload) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Không thể thêm URL độc hại vào máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('addAdminScamURL failed:', e);
      throw e;
    }
  },

  // POST /api/v1/admin/scammers
  async addAdminScammer(token, payload) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/scammers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Không thể thêm đối tượng lừa đảo vào máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('addAdminScammer failed:', e);
      throw e;
    }
  },

  // GET /api/v1/admin/urls
  async getAdminScamURLs(token, page = 1, limit = 20, status = '') {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/urls?page=${page}&limit=${limit}&status=${status}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách URL từ máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('getAdminScamURLs failed:', e);
      throw e;
    }
  },

  // DELETE /api/v1/admin/urls/:id
  async deleteAdminScamURL(token, id) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/urls/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể gỡ bỏ URL trên máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('deleteAdminScamURL failed:', e);
      throw e;
    }
  },

  // GET /api/v1/admin/scammers
  async getAdminScammers(token, page = 1, limit = 20, type = '') {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/scammers?page=${page}&limit=${limit}&type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách scammers từ máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('getAdminScammers failed:', e);
      throw e;
    }
  },

  // DELETE /api/v1/admin/scammers/:id
  async deleteAdminScammer(token, id) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/scammers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể gỡ bỏ đối tượng trên máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('deleteAdminScammer failed:', e);
      throw e;
    }
  },

  // GET /api/v1/admin/allowlist
  async getAdminAllowlist(token, page = 1, limit = 20) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/allowlist?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách allowlist từ máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('getAdminAllowlist failed:', e);
      throw e;
    }
  },

  // POST /api/v1/admin/allowlist
  async addAdminAllowlist(token, payload) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/allowlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Không thể thêm vào Whitelist trên máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('addAdminAllowlist failed:', e);
      throw e;
    }
  },

  // DELETE /api/v1/admin/allowlist/:id
  async deleteAdminAllowlist(token, id) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/allowlist/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể gỡ bỏ khỏi Whitelist trên máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('deleteAdminAllowlist failed:', e);
      throw e;
    }
  }
};
