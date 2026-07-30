<template>
  <div class="login-page">
    <!-- 背景网格动画 -->
    <div class="grid-bg"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="20" width="32" height="16" rx="2" stroke="#06b6d4" stroke-width="2"/>
            <path d="M8 20V12C8 8 12 4 20 4C28 4 32 8 32 12V20" stroke="#3b82f6" stroke-width="2"/>
            <circle cx="20" cy="28" r="3" fill="#06b6d4"/>
            <line x1="20" y1="31" x2="20" y2="35" stroke="#06b6d4" stroke-width="2"/>
          </svg>
        </div>
        <h1 class="system-title">矿穹智警</h1>
        <p class="system-subtitle">喀斯特矿区顶板灾变数字孪生预警与协同平台</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            class="login-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            class="login-input"
            @keyup.enter="handleLogin"
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
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span class="demo-hint">演示账号: admin / admin123</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/app'
    router.push(redirect)
  } catch (err: any) {
    const msg = err?.response?.data?.detail || '登录失败，请检查用户名和密码'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a1628;
  position: relative;
  overflow: hidden;
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { background-position: 0 0; }
  100% { background-position: 60px 60px; }
}

.login-card {
  width: 420px;
  padding: 48px 40px 36px;
  background: rgba(22, 40, 70, 0.85);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 40px rgba(59, 130, 246, 0.1),
    0 20px 60px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(6, 182, 212, 0.2);
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

.system-title {
  font-size: 22px;
  font-weight: 700;
  color: #e8edf5;
  margin: 0 0 8px;
  letter-spacing: 1px;
}

.system-subtitle {
  font-size: 13px;
  color: #8b9dc3;
  margin: 0;
}

.login-form {
  margin-top: 24px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.login-form :deep(.el-input__wrapper) {
  background: rgba(10, 22, 40, 0.8);
  border: 1px solid rgba(139, 157, 195, 0.2);
  border-radius: 8px;
  box-shadow: none;
  padding: 4px 12px;
  transition: border-color 0.3s;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(59, 130, 246, 0.4);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #06b6d4;
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.15);
}

.login-form :deep(.el-input__inner) {
  color: #e8edf5;
  font-size: 14px;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #5a6d8a;
}

.login-form :deep(.el-input__prefix .el-icon) {
  color: #8b9dc3;
  font-size: 16px;
}

.login-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  letter-spacing: 4px;
  transition: all 0.3s;
}

.login-btn:hover {
  background: linear-gradient(135deg, #2563eb, #0891b2);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.demo-hint {
  font-size: 12px;
  color: #5a6d8a;
  background: rgba(59, 130, 246, 0.08);
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(59, 130, 246, 0.15);
}
</style>
