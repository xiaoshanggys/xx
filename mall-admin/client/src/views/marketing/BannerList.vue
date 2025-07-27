<template>
  <div class="banner-list">
    <h1 class="page-title">轮播图管理</h1>
    
    <!-- 操作区域 -->
    <el-card class="action-card">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增轮播图</el-button>
    </el-card>
    
    <!-- 轮播图列表 -->
    <el-card>
      <el-table v-loading="loading" :data="bannerList">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="120">
          <template #default="scope">
            <el-image
              :src="scope.row.image || '/placeholder.jpg'"
              style="width: 80px; height: 45px;"
              fit="cover"
              preview-disabled
            />
          </template>
        </el-table-column>
        <el-table-column prop="link" label="跳转链接" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '隐藏' : '显示' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="bannerForm" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="轮播图片" prop="image">
          <div class="upload-area">
            <el-upload
              class="image-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload"
              :headers="uploadHeaders"
            >
              <img v-if="formData.image" :src="formData.image" class="uploaded-image" />
              <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">支持 jpg、png、gif 格式，大小不超过 5MB</div>
          </div>
        </el-form-item>
        
        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="formData.link" placeholder="请输入跳转链接（可选）" />
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" style="width: 100%;" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
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
import { useStore } from 'vuex';
import api from '../../api';

export default {
  name: 'BannerList',
  setup() {
    const store = useStore();
    const loading = ref(false);
    const bannerList = ref([]);
    const dialogVisible = ref(false);
    const submitLoading = ref(false);
    const isEdit = ref(false);
    const editId = ref(null);
    
    const formData = reactive({
      image: '',
      link: '',
      sort: 0,
      status: 1
    });
    
    const rules = {
      image: [
        { required: true, message: '请上传轮播图片', trigger: 'change' }
      ]
    };
    
    // 计算属性
    const dialogTitle = computed(() => isEdit.value ? '编辑轮播图' : '新增轮播图');
    const uploadUrl = computed(() => '/api/admin/upload');
    const uploadHeaders = computed(() => ({
      'Authorization': `Bearer ${store.getters['auth/token']}`
    }));
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString();
    };
    
    // 获取轮播图列表
    const fetchBannerList = async () => {
      try {
        loading.value = true;
        const response = await api.banner.getList();
        bannerList.value = response.data || [];
      } catch (error) {
        console.error('获取轮播图列表失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 新增轮播图
    const handleAdd = () => {
      isEdit.value = false;
      editId.value = null;
      resetForm();
      dialogVisible.value = true;
    };
    
    // 编辑轮播图
    const handleEdit = (row) => {
      isEdit.value = true;
      editId.value = row.id;
      formData.image = row.image;
      formData.link = row.link;
      formData.sort = row.sort;
      formData.status = row.status;
      dialogVisible.value = true;
    };
    
    // 删除轮播图
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm('确定删除该轮播图吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await api.banner.delete(row.id);
        ElMessage.success('删除成功');
        fetchBannerList();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除轮播图失败:', error);
        }
      }
    };
    
    // 切换状态
    const handleToggleStatus = async (row) => {
      const newStatus = row.status === 1 ? 0 : 1;
      const action = newStatus === 1 ? '显示' : '隐藏';
      
      try {
        await ElMessageBox.confirm(`确定要${action}该轮播图吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await api.banner.updateStatus(row.id, { status: newStatus });
        ElMessage.success(`${action}成功`);
        fetchBannerList();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('更新状态失败:', error);
        }
      }
    };
    
    // 图片上传成功
    const handleImageSuccess = (response) => {
      if (response.success) {
        formData.image = response.data.url;
        ElMessage.success('图片上传成功');
      } else {
        ElMessage.error(response.message || '图片上传失败');
      }
    };
    
    // 图片上传前验证
    const beforeImageUpload = (file) => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isLt5M = file.size / 1024 / 1024 < 5;
      
      if (!isValidType) {
        ElMessage.error('只能上传 JPG、PNG、GIF 格式的图片');
        return false;
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB');
        return false;
      }
      return true;
    };
    
    // 提交表单
    const handleSubmit = async () => {
      try {
        // 表单验证
        await bannerForm.value.validate();
        
        submitLoading.value = true;
        
        if (isEdit.value) {
          await api.banner.update(editId.value, formData);
          ElMessage.success('更新成功');
        } else {
          await api.banner.create(formData);
          ElMessage.success('新增成功');
        }
        
        dialogVisible.value = false;
        fetchBannerList();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        submitLoading.value = false;
      }
    };
    
    // 重置表单
    const resetForm = () => {
      formData.image = '';
      formData.link = '';
      formData.sort = 0;
      formData.status = 1;
    };
    
    // 对话框关闭处理
    const handleDialogClose = () => {
      resetForm();
    };
    
    const bannerForm = ref(null);
    
    onMounted(() => {
      fetchBannerList();
    });
    
    return {
      loading,
      bannerList,
      dialogVisible,
      submitLoading,
      dialogTitle,
      uploadUrl,
      uploadHeaders,
      formData,
      rules,
      bannerForm,
      formatDate,
      handleAdd,
      handleEdit,
      handleDelete,
      handleToggleStatus,
      handleImageSuccess,
      beforeImageUpload,
      handleSubmit,
      handleDialogClose
    };
  }
}
</script>

<style scoped>
.banner-list {
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

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.image-uploader:hover {
  border-color: #409EFF;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.uploaded-image {
  width: 178px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}
</style> 