import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

const getRole = (name, email) => {
  const nameLower = (name || '').toLowerCase();
  const emailLower = (email || '').toLowerCase();
  if (nameLower.includes('admin') || emailLower === 'admin@chongluadao.vn') {
    return 'admin';
  }
  if (nameLower.includes('moderator') || nameLower.includes('support') || emailLower.includes('support@')) {
    return 'moderator';
  }
  return 'user';
};

export function AuthProvider({ children, addToast }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const avatar = localStorage.getItem('userAvatar') || '';
    const role = localStorage.getItem('userRole') || getRole(name, email);
    return { name, email, avatar, role };
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem('token', tokenValue);
    if (userData.name) localStorage.setItem('userName', userData.name);
    if (userData.email) localStorage.setItem('userEmail', userData.email);
    if (userData.avatar) localStorage.setItem('userAvatar', userData.avatar);
    if (userData.role) localStorage.setItem('userRole', userData.role);

    setToken(tokenValue);
    setIsLoggedIn(true);
    setUser({
      name: userData.name || '',
      email: userData.email || '',
      avatar: userData.avatar || '',
      role: userData.role || getRole(userData.name || '', userData.email || '')
    });

    window.dispatchEvent(new Event('auth-change'));
  }, []);

  const logout = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        await api.logout(currentToken);
      }
    } catch (error) {
      console.warn('API logout failed, performing local logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userAvatar');
      localStorage.removeItem('userRole');
      
      setToken(null);
      setIsLoggedIn(false);
      setUser({ name: '', email: '', avatar: '', role: 'user' });

      window.dispatchEvent(new Event('auth-change'));
      if (addToast) {
        addToast('Đã đăng xuất tài khoản thành công.', 'info');
      }
    }
  }, [addToast]);

  // Sync user profile when token changes
  useEffect(() => {
    const fetchProfile = async () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        if (currentToken.startsWith('mock-admin-')) {
          setIsLoggedIn(true);
          setUser({
            name: localStorage.getItem('userName') || 'Quản trị viên',
            email: localStorage.getItem('userEmail') || 'admin@chongluadao.vn',
            avatar: '',
            role: 'admin'
          });
          return;
        }
        if (currentToken.startsWith('mock-moderator-')) {
          setIsLoggedIn(true);
          setUser({
            name: localStorage.getItem('userName') || 'Tư Vấn Viên',
            email: localStorage.getItem('userEmail') || 'support@chongluadao.vn',
            avatar: '',
            role: 'moderator'
          });
          return;
        }

        try {
          const res = await api.getMe(currentToken);
          let nameToSet = '';
          let emailToSet = '';
          let avatarToSet = '';
          let roleToSet = 'user';

          if (res.user) {
            nameToSet = res.user.name || res.user.username || '';
            emailToSet = res.user.email || '';
            avatarToSet = res.user.avatar || '';
            roleToSet = res.user.role || 'user';
          } else {
            nameToSet = res.name || res.username || '';
            emailToSet = res.email || '';
            avatarToSet = res.avatar || '';
            roleToSet = res.role || 'user';
          }

          if (nameToSet) localStorage.setItem('userName', nameToSet);
          if (emailToSet) localStorage.setItem('userEmail', emailToSet);
          if (avatarToSet) localStorage.setItem('userAvatar', avatarToSet);
          if (roleToSet) localStorage.setItem('userRole', roleToSet);

          setUser({
            name: nameToSet,
            email: emailToSet,
            avatar: avatarToSet,
            role: roleToSet
          });
          setIsLoggedIn(true);
        } catch (error) {
          console.warn('Không thể đồng bộ thông tin tài khoản:', error);
          if (error.status) {
            logout();
          }
        }
      } else {
        setIsLoggedIn(false);
        setUser({ name: '', email: '', avatar: '', role: 'user' });
      }
    };

    fetchProfile();
    window.addEventListener('auth-change', fetchProfile);
    return () => {
      window.removeEventListener('auth-change', fetchProfile);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      token,
      isLoggedIn,
      user,
      login,
      logout,
      isLoginOpen,
      setIsLoginOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
