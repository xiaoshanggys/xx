import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';
import store from '../store';

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true // 携带cookie
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 设置loading
    store.dispatch('app/setLoading', true);
    
    // 添加token
    const token = store.getters['auth/token'];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    store.dispatch('app/setLoading', false);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    store.dispatch('app/setLoading', false);
    
    const { success, message, data } = response.data;
    
    if (success) {
      return { data, message };
    } else {
      ElMessage.error(message || '请求失败');
      return Promise.reject(new Error(message || '请求失败'));
    }
  },
  error => {
    store.dispatch('app/setLoading', false);
    
    let message = '请求失败';
    let shouldShowMessage = true;
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 检查当前路径，避免在登录页面重复跳转
          const currentPath = router.currentRoute.value.path;
          if (currentPath !== '/login') {
            message = '登录已过期，请重新登录';
            store.dispatch('auth/logout');
            router.push('/login');
          } else {
            // 如果已经在登录页面，说明是登录失败，不是登录过期
            message = data?.message || '用户名或密码错误';
          }
          break;
        case 403:
          message = '权限不足';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = data?.message || '请求失败';
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时';
    } else if (error.message === 'Network Error') {
      message = '网络连接失败';
    }
    
    // 只显示一次错误消息，避免重复
    if (shouldShowMessage) {
      ElMessage.error(message);
    }
    
    return Promise.reject(error);
  }
);

// API模块
const api = {
  // 认证相关
  auth: {
    login: (data) => request.post('/auth/login', data),
    logout: () => request.post('/auth/logout'),
    getUserInfo: () => request.get('/auth/me'),
    changePassword: (data) => request.post('/auth/change-password', data)
  },
  
  // 数据总览
  dashboard: {
    getOverview: () => request.get('/admin/dashboard/overview')
  },
  
  // 商品管理
  product: {
    getList: (params) => request.get('/admin/products', { params }),
    create: (data) => request.post('/admin/products', data),
    update: (id, data) => request.put(`/admin/products/${id}`, data),
    delete: (id) => request.delete(`/admin/products/${id}`)
  },
  
  // 订单管理
  order: {
    getList: (params) => request.get('/admin/orders', { params }),
    updateStatus: (id, data) => request.patch(`/admin/orders/${id}/status`, data)
  },
  
  // 用户管理
  user: {
    getList: (params) => request.get('/admin/users', { params })
  },
  
  // 分类管理
  category: {
    getList: () => request.get('/admin/categories'),
    create: (data) => request.post('/admin/categories', data),
    update: (id, data) => request.put(`/admin/categories/${id}`, data),
    delete: (id) => request.delete(`/admin/categories/${id}`)
  },
  
  // 轮播图管理
  banner: {
    getList: () => request.get('/admin/banners'),
    create: (data) => request.post('/admin/banners', data),
    update: (id, data) => request.put(`/admin/banners/${id}`, data),
    delete: (id) => request.delete(`/admin/banners/${id}`),
    updateStatus: (id, data) => request.patch(`/admin/banners/${id}/status`, data),
    updateSort: (id, data) => request.patch(`/admin/banners/${id}/sort`, data)
  },
  
  // 购物车管理
  cart: {
    getList: (params) => request.get('/admin/carts', { params }),
    delete: (id) => request.delete(`/admin/carts/${id}`)
  },
  
  // 收货地址管理
  address: {
    getList: (params) => request.get('/admin/addresses', { params }),
    delete: (id) => request.delete(`/admin/addresses/${id}`)
  },
  
  // 优惠券管理
  coupon: {
    getList: (params) => request.get('/admin/coupons', { params }),
    create: (data) => request.post('/admin/coupons', data),
    delete: (id) => request.delete(`/admin/coupons/${id}`)
  },
  
  // 推荐商品管理
  recommend: {
    getList: () => request.get('/admin/recommend-products'),
    create: (data) => request.post('/admin/recommend-products', data),
    delete: (id) => request.delete(`/admin/recommend-products/${id}`)
  },
  
  // 评价管理
  review: {
    getList: (params) => request.get('/admin/reviews', { params }),
    delete: (id) => request.delete(`/admin/reviews/${id}`)
  },
  
  // 售后管理
  aftersale: {
    getList: (params) => request.get('/admin/aftersales', { params }),
    process: (id, data) => request.patch(`/admin/aftersales/${id}/process`, data)
  },
  
  // 文件上传
  upload: (formData) => request.post('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

export default api; 