<template>
  <div class="dashboard">
    <h1 class="page-title">数据总览</h1>
    
    <!-- 数据卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon today-orders">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ overview.todayOrders }}</div>
              <div class="stats-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon today-sales">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">¥{{ overview.todaySales?.toFixed(2) }}</div>
              <div class="stats-label">今日销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total-users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ overview.totalUsers }}</div>
              <div class="stats-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total-products">
              <el-icon><Goods /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ overview.totalProducts }}</div>
              <div class="stats-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快捷操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="actions-grid">
            <el-button 
              type="primary" 
              icon="Plus" 
              @click="$router.push('/products?action=add')"
            >
              新增商品
            </el-button>
            <el-button 
              type="success" 
              icon="View" 
              @click="$router.push('/orders')"
            >
              查看订单
            </el-button>
            <el-button 
              type="info" 
              icon="User" 
              @click="$router.push('/users')"
            >
              管理用户
            </el-button>
            <el-button 
              type="warning" 
              icon="Setting"
            >
              系统设置
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>系统信息</span>
          </template>
          <div class="system-info">
            <div class="info-item">
              <span class="label">服务器时间：</span>
              <span class="value">{{ currentTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">今日新增用户：</span>
              <span class="value">{{ overview.todayUsers }}</span>
            </div>
            <div class="info-item">
              <span class="label">库存预警：</span>
              <span class="value warning">{{ overview.lowStockProducts }} 个商品</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../api';

export default {
  name: 'Dashboard',
  setup() {
    const overview = ref({
      todayOrders: 0,
      todaySales: 0,
      totalUsers: 0,
      totalProducts: 0,
      todayUsers: 0,
      lowStockProducts: 0
    });
    
    const currentTime = ref('');
    let timer = null;
    
    // 更新时间
    const updateTime = () => {
      currentTime.value = new Date().toLocaleString();
    };
    
    // 获取数据总览
    const fetchOverview = async () => {
      try {
        const response = await api.dashboard.getOverview();
        overview.value = response.data;
      } catch (error) {
        console.error('获取数据总览失败:', error);
      }
    };
    
    onMounted(() => {
      fetchOverview();
      updateTime();
      timer = setInterval(updateTime, 1000);
    });
    
    onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
      }
    });
    
    return {
      overview,
      currentTime
    };
  }
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 120px;
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stats-icon.today-orders {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.today-sales {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.total-users {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.total-products {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info {
  flex: 1;
}

.stats-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}

.quick-actions {
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.actions-grid .el-button {
  justify-self: stretch;
}

.system-info {
  space-y: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-size: 14px;
}

.value {
  color: #333;
  font-weight: 500;
}

.value.warning {
  color: #e6a23c;
}
</style> 