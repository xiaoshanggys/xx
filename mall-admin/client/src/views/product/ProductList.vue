<template>
  <div class="product-list">
    <h1 class="page-title">商品管理</h1>
    
    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prepend>
              <el-select v-model="searchForm.category" placeholder="分类" style="width: 120px;">
                <el-option label="全部分类" value="" />
                <el-option label="数码产品" value="1" />
                <el-option label="服装鞋帽" value="2" />
              </el-select>
            </template>
            <template #append>
              <el-button icon="Search" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="8" class="text-right">
          <el-button type="primary" icon="Plus" @click="handleAdd">新增商品</el-button>
          <el-button type="danger" icon="Delete" :disabled="!selectedIds.length" @click="handleBatchDelete">
            批量删除
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 商品列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="productList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="scope">
            <el-image
              :src="scope.row.image || '/placeholder.jpg'"
              style="width: 60px; height: 60px;"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
  name: 'ProductList',
  setup() {
    const loading = ref(false);
    const productList = ref([]);
    const selectedIds = ref([]);
    
    const searchForm = reactive({
      keyword: '',
      category: ''
    });
    
    const pagination = reactive({
      page: 1,
      limit: 20,
      total: 0
    });
    
    // 获取商品列表
    const fetchProductList = async () => {
      try {
        loading.value = true;
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          keyword: searchForm.keyword,
          category: searchForm.category
        };
        
        const response = await api.product.getList(params);
        productList.value = response.data.list || [];
        pagination.total = response.data.total || 0;
        
      } catch (error) {
        console.error('获取商品列表失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 搜索
    const handleSearch = () => {
      pagination.page = 1;
      fetchProductList();
    };
    
    // 新增商品
    const handleAdd = () => {
      ElMessage.info('新增商品功能待实现');
    };
    
    // 编辑商品
    const handleEdit = (row) => {
      ElMessage.info(`编辑商品: ${row.name}`);
    };
    
    // 删除商品
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确定删除商品"${row.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        ElMessage.success('删除成功');
        fetchProductList();
      } catch (error) {
        // 用户取消
      }
    };
    
    // 切换商品状态
    const handleToggleStatus = async (row) => {
      const action = row.status === 1 ? '下架' : '上架';
      try {
        await ElMessageBox.confirm(`确定要${action}商品"${row.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        ElMessage.success(`${action}成功`);
        fetchProductList();
      } catch (error) {
        // 用户取消
      }
    };
    
    // 批量删除
    const handleBatchDelete = async () => {
      try {
        await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个商品吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        ElMessage.success('批量删除成功');
        selectedIds.value = [];
        fetchProductList();
      } catch (error) {
        // 用户取消
      }
    };
    
    // 选择变化
    const handleSelectionChange = (selection) => {
      selectedIds.value = selection.map(item => item.id);
    };
    
    // 分页变化
    const handleSizeChange = (size) => {
      pagination.limit = size;
      pagination.page = 1;
      fetchProductList();
    };
    
    const handleCurrentChange = (page) => {
      pagination.page = page;
      fetchProductList();
    };
    
    onMounted(() => {
      fetchProductList();
    });
    
    return {
      loading,
      productList,
      selectedIds,
      searchForm,
      pagination,
      handleSearch,
      handleAdd,
      handleEdit,
      handleDelete,
      handleToggleStatus,
      handleBatchDelete,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange
    };
  }
}
</script>

<style scoped>
.product-list {
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