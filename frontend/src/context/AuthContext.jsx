import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

const getRole = (name, email) => {
  const nameLower = (name || '').toLowerCase();
  const emailLower = (email || '').toLowerCase();
  if (nameLower.includes('admin') || emailLower === 'admin@shield.vn') {
    return 'admin';
  }
  if (nameLower.includes('moderator') || nameLower.includes('support') || emailLower.includes('support@')) {
    return 'moderator';
  }
  return 'user';
};

export function AuthProvider({ children }) {
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

  const login = useCallback((tokenValue, userData = {}) => {
    localStorage.setItem('token', tokenValue);
    if (userData.name) localStorage.setItem('userName', userData.name);
    if (userData.email) localStorage.setItem('userEmail', userData.email);
    if (userData.avatar) localStorage.setItem('userAvatar', userData.avatar);
    
    const role = userData.role || getRole(userData.name || '', userData.email || '');
    localStorage.setItem('userRole', role);

    setToken(tokenValue);
    setIsLoggedIn(true);
    setUser({
      name: userData.name || '',
      email: userData.email || '',
      avatar: userData.avatar || '',
      role
    });
  }, []);

  const logout = useCallback(async (notifyCallback) => {
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

      if (typeof notifyCallback === 'function') {
        notifyCallback();
      }
    }
  }, []);

  // Sync user profile when token exists
  useEffect(() => {
    const fetchProfile = async () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setIsLoggedIn(false);
        setUser({ name: '', email: '', avatar: '', role: 'user' });
        return;
      }

      if (currentToken.startsWith('mock-admin-')) {
        setIsLoggedIn(true);
        setUser({
          name: localStorage.getItem('userName') || 'Quản trị viên',
          email: localStorage.getItem('userEmail') || 'admin@shield.vn',
          avatar: '',
          role: 'admin'
        });
        return;
      }

      if (currentToken.startsWith('mock-moderator-')) {
        setIsLoggedIn(true);
        setUser({
          name: localStorage.getItem('userName') || 'Tư Vấn Viên',
          email: localStorage.getItem('userEmail') || 'support@shield.vn',
          avatar: '',
          role: 'moderator'
        });
        return;
      }

      try {
        const res = await api.getMe(currentToken);
        const userData = res.user || res;
        const nameToSet = userData.name || userData.username || '';
        const emailToSet = userData.email || '';
        const avatarToSet = userData.avatar || '';
        const roleToSet = userData.role || getRole(nameToSet, emailToSet);

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
        if (error.status === 401 || error.status === 403) {
          logout();
        }
      }
    };

    fetchProfile();
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
