<template>
  <div class="layout-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
        <div class="logo">
          <img src="/favicon.ico" alt="Logo" v-if="!isCollapse">
          <span v-if="!isCollapse">商城管理</span>
        </div>
        
        <el-menu
          :default-active="$route.path"
          :collapse="isCollapse"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <!-- 数据统计 -->
          <el-sub-menu index="statistics">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>数据统计</span>
            </template>
            <el-menu-item index="/dashboard">
              <el-icon><Odometer /></el-icon>
              <span>数据总览</span>
            </el-menu-item>
            <el-menu-item index="/statistics/orders">
              <el-icon><Document /></el-icon>
              <span>订单统计</span>
            </el-menu-item>
            <el-menu-item index="/statistics/users">
              <el-icon><User /></el-icon>
              <span>用户统计</span>
            </el-menu-item>
            <el-menu-item index="/statistics/products">
              <el-icon><Goods /></el-icon>
              <span>商品统计</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 商品管理 -->
          <el-sub-menu index="products">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/products">
              <el-icon><List /></el-icon>
              <span>商品列表</span>
            </el-menu-item>
            <el-menu-item index="/categories">
              <el-icon><Menu /></el-icon>
              <span>商品分类</span>
            </el-menu-item>
            <el-menu-item index="/reviews">
              <el-icon><ChatLineRound /></el-icon>
              <span>商品评价</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 订单管理 -->
          <el-sub-menu index="orders">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/orders">
              <el-icon><List /></el-icon>
              <span>订单列表</span>
            </el-menu-item>
            <el-menu-item index="/aftersales">
              <el-icon><Service /></el-icon>
              <span>售后管理</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 用户管理 -->
          <el-sub-menu index="users">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/users">
              <el-icon><List /></el-icon>
              <span>用户列表</span>
            </el-menu-item>
            <el-menu-item index="/carts">
              <el-icon><ShoppingCart /></el-icon>
              <span>购物车管理</span>
            </el-menu-item>
            <el-menu-item index="/addresses">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 营销管理 -->
          <el-sub-menu index="marketing">
            <template #title>
              <el-icon><Promotion /></el-icon>
              <span>营销管理</span>
            </template>
            <el-menu-item index="/banners">
              <el-icon><Picture /></el-icon>
              <span>轮播图</span>
            </el-menu-item>
            <el-menu-item index="/recommends">
              <el-icon><Star /></el-icon>
              <span>推荐商品</span>
            </el-menu-item>
            <el-menu-item index="/coupons">
              <el-icon><Ticket /></el-icon>
              <span>优惠券</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 系统管理 -->
          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/payments">
              <el-icon><CreditCard /></el-icon>
              <span>支付方式</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Tools /></el-icon>
              <span>系统设置</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      
      <!-- 主体区域 -->
      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-left">
            <el-button 
              type="text" 
              @click="toggleSidebar"
              class="collapse-btn"
            >
              <el-icon><Expand v-if="isCollapse" /><Fold v-else /></el-icon>
            </el-button>
            
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar size="small" icon="UserFilled" />
                <span class="username">{{ user?.name || '管理员' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 内容区域 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 全局loading -->
    <div v-if="loading" class="global-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';

export default {
  name: 'Layout',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const isCollapse = computed(() => store.getters['app/isCollapse']);
    const loading = computed(() => store.getters['app/loading']);
    const user = computed(() => store.getters['auth/user']);
    
    const toggleSidebar = () => {
      store.dispatch('app/toggleSidebar');
    };
    
    const handleCommand = async (command) => {
      switch (command) {
        case 'changePassword':
          // TODO: 实现修改密码功能
          ElMessage.info('修改密码功能待实现');
          break;
        case 'logout':
          try {
            await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            });
            
            await store.dispatch('auth/logout');
            ElMessage.success('已退出登录');
            router.push('/login');
          } catch (error) {
            // 用户取消
          }
          break;
      }
    };
    
    return {
      isCollapse,
      loading,
      user,
      toggleSidebar,
      handleCommand
    };
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  position: relative;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #434a52;
}

.logo img {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 20px;
  font-size: 18px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 12px;
}

.username {
  margin: 0 8px;
  font-size: 14px;
}

.main-content {
  background: #f5f5f5;
  padding: 20px;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-icon {
  font-size: 24px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 