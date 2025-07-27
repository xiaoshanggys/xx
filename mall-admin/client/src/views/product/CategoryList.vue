<template>
  <div class="category-list">
    <h1 class="page-title">商品分类管理</h1>
    
    <!-- 操作区域 -->
    <el-card class="action-card">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增分类</el-button>
    </el-card>
    
    <!-- 分类列表 -->
    <el-card>
      <el-table v-loading="loading" :data="categoryList">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="parent_id" label="父级分类" width="120">
          <template #default="scope">
            {{ scope.row.parent_id === 0 ? '顶级分类' : getParentName(scope.row.parent_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="创建时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="500px"
      @close="handleDialogClose"
    >
      <el-form ref="categoryForm" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类" prop="parent_id">
          <el-select v-model="formData.parent_id" placeholder="请选择父级分类" style="width: 100%;">
            <el-option label="顶级分类" :value="0" />
            <el-option 
              v-for="category in topCategories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" style="width: 100%;" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ submitLoading ? '提交中...' : '确定' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../../api';

export default {
  name: 'CategoryList',
  setup() {
    const loading = ref(false);
    const categoryList = ref([]);
    const dialogVisible = ref(false);
    const submitLoading = ref(false);
    const isEdit = ref(false);
    const editId = ref(null);
    
    const formData = reactive({
      name: '',
      parent_id: 0,
      sort: 0
    });
    
    const rules = {
      name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' }
      ]
    };
    
    // 计算属性
    const dialogTitle = computed(() => isEdit.value ? '编辑分类' : '新增分类');
    const topCategories = computed(() => categoryList.value.filter(item => item.parent_id === 0));
    
    // 获取父级分类名称
    const getParentName = (parentId) => {
      const parent = categoryList.value.find(item => item.id === parentId);
      return parent ? parent.name : '未知';
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString();
    };
    
    // 获取分类列表
    const fetchCategoryList = async () => {
      try {
        loading.value = true;
        const response = await api.category.getList();
        categoryList.value = response.data || [];
      } catch (error) {
        console.error('获取分类列表失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 新增分类
    const handleAdd = () => {
      isEdit.value = false;
      editId.value = null;
      resetForm();
      dialogVisible.value = true;
    };
    
    // 编辑分类
    const handleEdit = (row) => {
      isEdit.value = true;
      editId.value = row.id;
      formData.name = row.name;
      formData.parent_id = row.parent_id;
      formData.sort = row.sort;
      dialogVisible.value = true;
    };
    
    // 删除分类
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确定删除分类"${row.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await api.category.delete(row.id);
        ElMessage.success('删除成功');
        fetchCategoryList();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除分类失败:', error);
        }
      }
    };
    
    // 提交表单
    const handleSubmit = async () => {
      try {
        // 表单验证
        await categoryForm.value.validate();
        
        submitLoading.value = true;
        
        if (isEdit.value) {
          await api.category.update(editId.value, formData);
          ElMessage.success('更新成功');
        } else {
          await api.category.create(formData);
          ElMessage.success('新增成功');
        }
        
        dialogVisible.value = false;
        fetchCategoryList();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        submitLoading.value = false;
      }
    };
    
    // 重置表单
    const resetForm = () => {
      formData.name = '';
      formData.parent_id = 0;
      formData.sort = 0;
    };
    
    // 对话框关闭处理
    const handleDialogClose = () => {
      resetForm();
    };
    
    const categoryForm = ref(null);
    
    onMounted(() => {
      fetchCategoryList();
    });
    
    return {
      loading,
      categoryList,
      dialogVisible,
      submitLoading,
      dialogTitle,
      topCategories,
      formData,
      rules,
      categoryForm,
      getParentName,
      formatDate,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      handleDialogClose
    };
  }
}
</script>

<style scoped>
.category-list {
  padding: 0;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.action-card {
  margin-bottom: 20px;
}
</style> 