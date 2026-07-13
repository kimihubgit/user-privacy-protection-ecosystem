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
      const response = await fetch(`${API_CHECK_URL}/api/reports`, {
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
      const response = await fetch(`${API_CHECK_URL}/api/reports`, {
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
      const response = await fetch(`${API_CHECK_URL}/api/reports/status?page=${page}&limit=${limit}`, {
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
  }
};
