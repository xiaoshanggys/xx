<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>商城管理后台</h2>
        <p>请使用管理员账号登录</p>
      </div>
      
      <el-form 
        ref="loginForm" 
        :model="loginData" 
        :rules="rules" 
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="loginData.username" 
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginData.password" 
            type="password" 
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>默认账号：admin，密码：admin</p>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export default {
  name: 'Login',
  setup() {
    const store = useStore();
    const router = useRouter();
    const loginForm = ref(null);
    const loading = ref(false);
    
    const loginData = reactive({
      username: 'admin',
      password: 'admin'
    });
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 3, message: '密码长度不能少于3位', trigger: 'blur' }
      ]
    };
    
    const handleLogin = async () => {
      try {
        const valid = await loginForm.value.validate();
        if (!valid) return;
        
        loading.value = true;
        
        await store.dispatch('auth/login', loginData);
        
        ElMessage.success('登录成功');
        router.push('/dashboard');
        
      } catch (error) {
        console.error('登录失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    return {
      loginForm,
      loginData,
      rules,
      loading,
      handleLogin
    };
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
}

.login-footer {
  text-align: center;
}

.login-footer p {
  color: #999;
  font-size: 12px;
}
</style> 