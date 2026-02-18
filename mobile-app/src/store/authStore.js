import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,

  login: async (user, token) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      role: user.role
    });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null
    });
  },

  loadUser: async () => {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
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
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
    }
  },

  init: async () => {
    await useAuthStore.getState().loadUser();
  },

  updateUser: (user) => {
    set({user});
    AsyncStorage.setItem('user', JSON.stringify(user));
  }
}));

export default useAuthStore;
