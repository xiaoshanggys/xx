<template>
  <div class="cart-list">
    <h1 class="page-title">购物车管理</h1>
    
    <el-card>
      <div class="placeholder-content">
        <el-icon size="80" color="#ccc"><ShoppingCart /></el-icon>
        <p>购物车管理功能正在开发中...</p>
        <el-button type="primary" @click="handleRefresh">刷新页面</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CartList',
  setup() {
    const handleRefresh = () => {
      location.reload();
    };
    
    return {
      handleRefresh
    };
  }
}
</script>

<style scoped>
.cart-list {
  padding: 0;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.placeholder-content {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.placeholder-content p {
  margin: 20px 0;
  font-size: 16px;
}
</style> 