import api from '../../api';

const state = {
  user: null,
  token: localStorage.getItem('admin_token') || null,
  isLoggedIn: false
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
    state.isLoggedIn = !!user;
  },
  SET_TOKEN(state, token) {
    state.token = token;
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  },
  CLEAR_AUTH(state) {
    state.user = null;
    state.token = null;
    state.isLoggedIn = false;
    localStorage.removeItem('admin_token');
  }
};

const actions = {
  // 登录
  async login({ commit }, credentials) {
    try {
      const response = await api.auth.login(credentials);
      const { adminInfo, token } = response.data;
      
      commit('SET_USER', adminInfo);
      commit('SET_TOKEN', token);
      
      return response;
    } catch (error) {
      commit('CLEAR_AUTH');
      throw error;
    }
  },

  // 获取用户信息
  async getUserInfo({ commit }) {
    try {
      const response = await api.auth.getUserInfo();
      commit('SET_USER', response.data);
      return response;
    } catch (error) {
      commit('CLEAR_AUTH');
      throw error;
    }
  },

  // 退出登录
  async logout({ commit }) {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('退出登录请求失败:', error);
    } finally {
      commit('CLEAR_AUTH');
    }
  }
};

const getters = {
  isLoggedIn: state => state.isLoggedIn,
  user: state => state.user,
  token: state => state.token
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}; 