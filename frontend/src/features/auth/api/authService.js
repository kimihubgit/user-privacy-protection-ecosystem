import { get } from '@github/webauthn-json';
import { getErrorMessage } from '../../../utils/helpers';
import { API_AUTH_URL } from '../../../lib/config';

export const authService = {
  // Auth Passkey Login API
  async loginWithPasskey() {
    try {
      const beginRes = await fetch(`${API_AUTH_URL}/api/v1/auth/passkey/login/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!beginRes.ok) {
        const errData = await beginRes.json().catch(() => ({}));
        throw new Error(getErrorMessage(errData, 'Không khởi tạo được đăng nhập Passkey!'));
      }

      const { options, session_id } = await beginRes.json();

      // Trigger WebAuthn browser dialog
      const assertion = await get(options);

      const finishRes = await fetch(`${API_AUTH_URL}/api/v1/auth/passkey/login/finish?session_id=${session_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertion)
      });

      if (!finishRes.ok) {
        const errData = await finishRes.json().catch(() => ({}));
        throw new Error(getErrorMessage(errData, 'Xác thực Passkey thất bại!'));
      }

      return await finishRes.json();
    } catch (e) {
      if (e.name === 'NotAllowedError' || e.name === 'AbortError') {
        throw new Error('Yêu cầu xác thực Passkey bị từ chối hoặc hủy bỏ.', { cause: e });
      }
      if (e instanceof TypeError) {
        console.warn(`Auth API connection to ${API_AUTH_URL} failed.`);
        throw new Error('Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra lại backend.', { cause: e });
      }
      throw e;
    }
  },

  // Auth Social Login API
  async socialLogin(provider, code) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/auth/social-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider,
          code
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errData, 'Đăng nhập mạng xã hội thất bại!'));
      }

      return await response.json();
    } catch (e) {
      if (e instanceof TypeError) {
        console.warn(`Auth API connection to ${API_AUTH_URL} failed.`);
        throw new Error('Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra lại backend.', { cause: e });
      }
      throw e;
    }
  },

  // Auth Login API
  async login(username, password) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errData, 'Sai tên đăng nhập hoặc mật khẩu!'));
      }

      return await response.json();
    } catch (e) {
      if (e instanceof TypeError) {
        console.warn(`Auth API connection to ${API_AUTH_URL} failed.`);
        throw new Error('Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra lại backend.', { cause: e });
      }
      throw e;
    }
  },

  // Auth Register API
  async register(username, email, password, repassword) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, repassword })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errData, 'Đăng ký không thành công!'));
      }

      return await response.json();
    } catch (e) {
      if (e instanceof TypeError) {
        console.warn(`Auth API connection to ${API_AUTH_URL} failed.`);
        throw new Error('Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra lại backend.', { cause: e });
      }
      throw e;
    }
  },

  // Auth Logout API
  async logout(token) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errData, 'Đăng xuất không thành công!'));
      }

      return await response.json().catch(() => ({}));
    } catch (e) {
      if (e instanceof TypeError) {
        console.warn('Auth API logout connection failed.');
        throw new Error('Không thể kết nối đến máy chủ xác thực để đăng xuất.', { cause: e });
      }
      throw e;
    }
  },

  async getMe(token) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = getErrorMessage(errData, 'Không thể lấy thông tin người dùng!');
        const error = new Error(errMsg);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (e) {
      if (e instanceof TypeError) {
        console.warn('Auth API getMe connection failed.');
        throw new Error('Không thể kết nối đến máy chủ xác thực.', { cause: e });
      }
      throw e;
    }
  },

  // Auth Check Email Availability API
  async checkEmail(email) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET'
      });
      if (!response.ok) return { exists: false };
      return await response.json();
    } catch (e) {
      console.warn('Auth API check-email connection failed, assuming not exists.', e);
      return { exists: false };
    }
  },

  // Auth Check Username Availability API
  async checkUsername(username) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/auth/check-username?username=${encodeURIComponent(username)}`, {
        method: 'GET'
      });
      if (!response.ok) return { exists: false };
      return await response.json();
    } catch (e) {
      console.warn('Auth API check-username connection failed, assuming not exists.', e);
      return { exists: false };
    }
  },

  // Get Admin Users list (paginated, searchable)
  async getAdminUsers(token, page = 1, limit = 20, search = '') {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách người dùng từ máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('getAdminUsers failed:', e);
      throw e;
    }
  },

  // Get Admin User Detail
  async getAdminUserDetail(token, id) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/users/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể tải chi tiết người dùng từ máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('getAdminUserDetail failed:', e);
      throw e;
    }
  },

  // PUT /api/v1/admin/users/:id/status
  async updateAdminUserStatus(token, id, status) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái người dùng trên máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('updateAdminUserStatus failed:', e);
      throw e;
    }
  },

  // PUT /api/v1/admin/users/:id/role
  async updateAdminUserRole(token, id, role) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        throw new Error('Không thể cập nhật quyền hạn người dùng trên máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('updateAdminUserRole failed:', e);
      throw e;
    }
  },

  // DELETE /api/v1/admin/users/:id
  async deleteAdminUser(token, id) {
    try {
      const response = await fetch(`${API_AUTH_URL}/api/v1/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể xóa tài khoản người dùng khỏi máy chủ!');
      }
      return await response.json();
    } catch (e) {
      console.error('deleteAdminUser failed:', e);
      throw e;
    }
  }
};
