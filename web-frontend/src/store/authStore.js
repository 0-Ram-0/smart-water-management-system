import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,

  login: (user, token) => {
    set({
      user,
      token,
      isAuthenticated: true,
      role: user.role
    });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  updateUser: (user) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Initialize from localStorage on mount
  init: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          role: user.role
        });
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }
}));

export default useAuthStore;
