import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, getUserInfoApi, type UserInfo } from '@/api/auth'

// Mock 用户数据（开发阶段使用）
const MOCK_USERS: Record<string, { password: string; info: UserInfo }> = {
  admin: {
    password: 'admin123',
    info: {
      id: 1, username: 'admin', email: 'admin@mine.com', full_name: '系统管理员',
      role: 'admin', organization: '煤矿安全管理局', is_active: true,
      last_login: '2026-07-24T08:00:00Z', created_at: '2026-01-01T00:00:00Z',
    },
  },
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => userInfo.value?.role)
  const userName = computed(() => userInfo.value?.full_name || userInfo.value?.username || '用户')
  const userOrganization = computed(() => userInfo.value?.organization || '')

  /** 登录（优先调 API，失败时回退到 mock） */
  async function login(username: string, password: string) {
    try {
      const res = await loginApi({ username, password })
      token.value = res.access_token
      localStorage.setItem('token', res.access_token)
      await fetchUserInfo()
    } catch {
      // API 不可用时回退到 mock
      const mock = MOCK_USERS[username]
      if (mock && mock.password === password) {
        const mockToken = `mock-token-${username}-${Date.now()}`
        token.value = mockToken
        localStorage.setItem('token', mockToken)
        userInfo.value = { ...mock.info }
      } else {
        throw new Error('用户名或密码错误')
      }
    }
  }

  /** 获取用户信息（API 失败时保留已有 userInfo，支持 mock 登录） */
  async function fetchUserInfo() {
    try {
      const res = await getUserInfoApi()
      userInfo.value = res
    } catch {
      // API 不可用时，如果 userInfo 已设置（mock 登录），保留它
      if (!userInfo.value) {
        logout()
      }
    }
  }

  /** 退出登录 */
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  /** 初始化：如果 localStorage 有 token，恢复用户信息 */
  async function initAuth() {
    if (token.value && !userInfo.value) {
      // mock token 模式：从 token 中提取用户名并恢复
      if (token.value.startsWith('mock-token-')) {
        const username = token.value.replace('mock-token-', '').replace(/-\d+$/, '')
        const mock = MOCK_USERS[username]
        if (mock) {
          userInfo.value = { ...mock.info }
          return
        }
      }
      try {
        await fetchUserInfo()
      } catch {
        logout()
      }
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userRole,
    userName,
    userOrganization,
    login,
    fetchUserInfo,
    logout,
    initAuth,
  }
})
