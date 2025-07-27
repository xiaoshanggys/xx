<template>
  <div class="order-list">
    <h1 class="page-title">订单管理</h1>
    
    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="20">
          <el-form :model="searchForm" inline>
            <el-form-item label="订单状态">
              <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
                <el-option label="全部状态" value="" />
                <el-option label="待付款" value="1" />
                <el-option label="待发货" value="2" />
                <el-option label="待收货" value="3" />
                <el-option label="已完成" value="4" />
                <el-option label="已取消" value="5" />
              </el-select>
            </el-form-item>
            <el-form-item label="订单号">
              <el-input
                v-model="searchForm.orderNo"
                placeholder="请输入订单号"
                clearable
                style="width: 200px;"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
              <el-button icon="Refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" class="text-right">
          <el-button type="success" icon="Download" @click="handleExport">导出订单</el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 订单列表 -->
    <el-card>
      <el-table v-loading="loading" :data="orderList">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="120" />
        <el-table-column prop="createTime" label="下单时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-dropdown @command="(command) => handleOrderAction(command, scope.row)">
              <el-button size="small">
                更多操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="scope.row.status === 1" command="cancel">取消订单</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 2" command="ship">发货</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 3" command="confirm">确认收货</el-dropdown-item>
                  <el-dropdown-item command="remark">添加备注</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../../api';

export default {
  name: 'OrderList',
  setup() {
    const loading = ref(false);
    const orderList = ref([]);
    
    const searchForm = reactive({
      status: '',
      orderNo: ''
    });
    
    const pagination = reactive({
      page: 1,
      limit: 20,
      total: 0
    });
    
    // 获取订单状态类型
    const getStatusType = (status) => {
      const typeMap = {
        1: 'warning',   // 待付款
        2: 'primary',   // 待发货
        3: 'info',      // 待收货
        4: 'success',   // 已完成
        5: 'danger'     // 已取消
      };
      return typeMap[status] || 'info';
    };
    
    // 获取订单状态文本
    const getStatusText = (status) => {
      const textMap = {
        1: '待付款',
        2: '待发货',
        3: '待收货',
        4: '已完成',
        5: '已取消'
      };
      return textMap[status] || '未知';
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString();
    };
    
    // 获取订单列表
    const fetchOrderList = async () => {
      try {
        loading.value = true;
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          status: searchForm.status,
          orderNo: searchForm.orderNo
        };
        
        const response = await api.order.getList(params);
        orderList.value = response.data.list || [];
        pagination.total = response.data.total || 0;
        
      } catch (error) {
        console.error('获取订单列表失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 搜索
    const handleSearch = () => {
      pagination.page = 1;
      fetchOrderList();
    };
    
    // 重置
    const handleReset = () => {
      searchForm.status = '';
      searchForm.orderNo = '';
      pagination.page = 1;
      fetchOrderList();
    };
    
    // 查看详情
    const handleViewDetail = (row) => {
      ElMessage.info(`查看订单详情: ${row.orderNo}`);
    };
    
    // 订单操作
    const handleOrderAction = async (command, row) => {
      const actionMap = {
        cancel: '取消订单',
        ship: '发货',
        confirm: '确认收货',
        remark: '添加备注'
      };
      
      if (command === 'remark') {
        ElMessage.info('添加备注功能待实现');
        return;
      }
      
      try {
        await ElMessageBox.confirm(`确定要${actionMap[command]}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        ElMessage.success(`${actionMap[command]}成功`);
        fetchOrderList();
      } catch (error) {
        // 用户取消
      }
    };
    
    // 导出订单
    const handleExport = () => {
      ElMessage.info('导出订单功能待实现');
    };
    
    // 分页变化
    const handleSizeChange = (size) => {
      pagination.limit = size;
      pagination.page = 1;
      fetchOrderList();
    };
    
    const handleCurrentChange = (page) => {
      pagination.page = page;
      fetchOrderList();
    };
    
    onMounted(() => {
      fetchOrderList();
    });
    
    return {
      loading,
      orderList,
      searchForm,
      pagination,
      getStatusType,
      getStatusText,
      formatDate,
      handleSearch,
      handleReset,
      handleViewDetail,
      handleOrderAction,
      handleExport,
      handleSizeChange,
      handleCurrentChange
    };
  }
}
</script>

<style scoped>
.order-list {
  padding: 0;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.search-card {
  margin-bottom: 20px;
}
</style> 