<template>
  <div class="user-list">
    <h1 class="page-title">用户管理</h1>
    
    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="20">
          <el-form :model="searchForm" inline>
            <el-form-item label="用户名">
              <el-input
                v-model="searchForm.username"
                placeholder="请输入用户名"
                clearable
                style="width: 200px;"
              />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input
                v-model="searchForm.mobile"
                placeholder="请输入手机号"
                clearable
                style="width: 200px;"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
                <el-option label="全部状态" value="" />
                <el-option label="正常" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
              <el-button icon="Refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" class="text-right">
          <el-button type="success" icon="Download" @click="handleExport">导出用户</el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 用户列表 -->
    <el-card>
      <el-table v-loading="loading" :data="userList">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar 
              :src="scope.row.avatar" 
              :icon="!scope.row.avatar ? 'UserFilled' : null"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="mobile" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.lastLoginTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-dropdown @command="(command) => handleUserAction(command, scope.row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resetPassword">重置密码</el-dropdown-item>
                  <el-dropdown-item command="viewOrders">查看订单</el-dropdown-item>
                  <el-dropdown-item command="viewAddress">收货地址</el-dropdown-item>
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
  name: 'UserList',
  setup() {
    const loading = ref(false);
    const userList = ref([]);
    
    const searchForm = reactive({
      username: '',
      mobile: '',
      status: ''
    });
    
    const pagination = reactive({
      page: 1,
      limit: 20,
      total: 0
    });
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString();
    };
    
    // 获取用户列表
    const fetchUserList = async () => {
      try {
        loading.value = true;
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          username: searchForm.username,
          mobile: searchForm.mobile,
          status: searchForm.status
        };
        
        const response = await api.user.getList(params);
        userList.value = response.data.list || [];
        pagination.total = response.data.total || 0;
        
      } catch (error) {
        console.error('获取用户列表失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 搜索
    const handleSearch = () => {
      pagination.page = 1;
      fetchUserList();
    };
    
    // 重置
    const handleReset = () => {
      searchForm.username = '';
      searchForm.mobile = '';
      searchForm.status = '';
      pagination.page = 1;
      fetchUserList();
    };
    
    // 查看详情
    const handleViewDetail = (row) => {
      ElMessage.info(`查看用户详情: ${row.username}`);
    };
    
    // 切换用户状态
    const handleToggleStatus = async (row) => {
      const action = row.status === 1 ? '禁用' : '启用';
      try {
        await ElMessageBox.confirm(`确定要${action}用户"${row.username}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        ElMessage.success(`${action}成功`);
        fetchUserList();
      } catch (error) {
        // 用户取消
      }
    };
    
    // 用户操作
    const handleUserAction = async (command, row) => {
      const actionMap = {
        resetPassword: '重置密码',
        viewOrders: '查看订单',
        viewAddress: '查看收货地址'
      };
      
      if (command === 'resetPassword') {
        try {
          await ElMessageBox.confirm(`确定要重置用户"${row.username}"的密码吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          });
          
          ElMessage.success('密码重置成功，新密码已发送到用户手机');
        } catch (error) {
          // 用户取消
        }
      } else {
        ElMessage.info(`${actionMap[command]}功能待实现`);
      }
    };
    
    // 导出用户
    const handleExport = () => {
      ElMessage.info('导出用户功能待实现');
    };
    
    // 分页变化
    const handleSizeChange = (size) => {
      pagination.limit = size;
      pagination.page = 1;
      fetchUserList();
    };
    
    const handleCurrentChange = (page) => {
      pagination.page = page;
      fetchUserList();
    };
    
    onMounted(() => {
      fetchUserList();
    });
    
    return {
      loading,
      userList,
      searchForm,
      pagination,
      formatDate,
      handleSearch,
      handleReset,
      handleViewDetail,
      handleToggleStatus,
      handleUserAction,
      handleExport,
      handleSizeChange,
      handleCurrentChange
    };
  }
}
</script>

<style scoped>
.user-list {
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