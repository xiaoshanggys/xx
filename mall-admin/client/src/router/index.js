import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

// 路由组件
const Login = () => import('../views/Login.vue');
const Layout = () => import('../views/Layout.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const ProductList = () => import('../views/product/ProductList.vue');
const CategoryList = () => import('../views/product/CategoryList.vue');
const ReviewList = () => import('../views/product/ReviewList.vue');
const OrderList = () => import('../views/order/OrderList.vue');
const AftersaleList = () => import('../views/order/AftersaleList.vue');
const UserList = () => import('../views/user/UserList.vue');
const CartList = () => import('../views/user/CartList.vue');
const AddressList = () => import('../views/user/AddressList.vue');
const BannerList = () => import('../views/marketing/BannerList.vue');
const RecommendList = () => import('../views/marketing/RecommendList.vue');
const CouponList = () => import('../views/marketing/CouponList.vue');
const PaymentList = () => import('../views/system/PaymentList.vue');
const Settings = () => import('../views/system/Settings.vue');

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: '登录',
      requireAuth: false 
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requireAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { 
          title: '数据总览',
          requireAuth: true 
        }
      },
      {
        path: 'products',
        name: 'ProductList',
        component: ProductList,
        meta: { 
          title: '商品管理',
          requireAuth: true 
        }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: OrderList,
        meta: { 
          title: '订单管理',
          requireAuth: true 
        }
      },
      {
        path: 'categories',
        name: 'CategoryList',
        component: CategoryList,
        meta: { 
          title: '商品分类',
          requireAuth: true 
        }
      },
      {
        path: 'reviews',
        name: 'ReviewList',
        component: ReviewList,
        meta: { 
          title: '商品评价',
          requireAuth: true 
        }
      },
      {
        path: 'aftersales',
        name: 'AftersaleList',
        component: AftersaleList,
        meta: { 
          title: '售后管理',
          requireAuth: true 
        }
      },
      {
        path: 'users',
        name: 'UserList',
        component: UserList,
        meta: { 
          title: '用户管理',
          requireAuth: true 
        }
      },
      {
        path: 'carts',
        name: 'CartList',
        component: CartList,
        meta: { 
          title: '购物车管理',
          requireAuth: true 
        }
      },
      {
        path: 'addresses',
        name: 'AddressList',
        component: AddressList,
        meta: { 
          title: '收货地址',
          requireAuth: true 
        }
      },
      {
        path: 'banners',
        name: 'BannerList',
        component: BannerList,
        meta: { 
          title: '轮播图管理',
          requireAuth: true 
        }
      },
      {
        path: 'recommends',
        name: 'RecommendList',
        component: RecommendList,
        meta: { 
          title: '推荐商品',
          requireAuth: true 
        }
      },
      {
        path: 'coupons',
        name: 'CouponList',
        component: CouponList,
        meta: { 
          title: '优惠券管理',
          requireAuth: true 
        }
      },
      {
        path: 'payments',
        name: 'PaymentList',
        component: PaymentList,
        meta: { 
          title: '支付方式',
          requireAuth: true 
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: { 
          title: '系统设置',
          requireAuth: true 
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 商城管理后台`;
  }

  // 检查是否需要登录
  if (to.meta.requireAuth !== false) {
    const token = store.getters['auth/token'];
    
    if (!token) {
      // 没有token，直接跳转到登录页
      next('/login');
      return;
    }
    
    const isLoggedIn = store.getters['auth/isLoggedIn'];
    
    if (!isLoggedIn) {
      // 有token但未登录，尝试获取用户信息
      try {
        await store.dispatch('auth/getUserInfo');
        next();
      } catch (error) {
        // 获取用户信息失败，清除token并跳转到登录页
        store.commit('auth/CLEAR_AUTH');
        next('/login');
      }
    } else {
      next();
    }
  } else {
    // 如果已经登录且访问登录页，重定向到首页
    if (to.path === '/login' && store.getters['auth/isLoggedIn']) {
      next('/dashboard');
    } else {
      next();
    }
  }
});

export default router; 