const state = {
  isCollapse: false, // 侧边栏是否折叠
  loading: false,    // 全局loading状态
  breadcrumb: []     // 面包屑导航
};

const mutations = {
  TOGGLE_SIDEBAR(state) {
    state.isCollapse = !state.isCollapse;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_BREADCRUMB(state, breadcrumb) {
    state.breadcrumb = breadcrumb;
  }
};

const actions = {
  toggleSidebar({ commit }) {
    commit('TOGGLE_SIDEBAR');
  },
  setLoading({ commit }, loading) {
    commit('SET_LOADING', loading);
  },
  setBreadcrumb({ commit }, breadcrumb) {
    commit('SET_BREADCRUMB', breadcrumb);
  }
};

const getters = {
  isCollapse: state => state.isCollapse,
  loading: state => state.loading,
  breadcrumb: state => state.breadcrumb
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}; 