import request from './index'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserInfo {
  id: number
  username: string
  email: string
  full_name: string | null
  role: 'admin' | 'enterprise' | 'think_tank' | 'regulatory' | 'operator'
  organization: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
}

/** 用户登录 */
export const loginApi = (data: LoginParams): Promise<LoginResponse> =>
  request.post('/auth/login', data) as any

/** 获取当前用户信息 */
export const getUserInfoApi = (): Promise<UserInfo> =>
  request.get('/auth/me') as any
