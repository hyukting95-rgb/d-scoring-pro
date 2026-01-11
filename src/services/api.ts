import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // 后端API基础URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 打印baseURL，确保配置正确
console.log('API服务配置:', {
  baseURL: api.defaults.baseURL
});

// 打印完整的API配置
console.log('完整API配置:', {
  baseURL: api.defaults.baseURL,
  timeout: api.defaults.timeout,
  headers: api.defaults.headers
});

// 请求拦截器，添加认证令牌和日志
api.interceptors.request.use((config) => {
  console.log('发送API请求:', {
    url: config.url,
    method: config.method,
    data: config.data,
    baseURL: config.baseURL
  });
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('API请求错误:', error);
  return Promise.reject(error);
});

// 响应拦截器，添加日志
api.interceptors.response.use((response) => {
  console.log('API响应成功:', {
    url: response.config.url,
    status: response.status,
    data: response.data
  });
  return response;
}, (error) => {
  console.error('API响应错误:', {
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data,
    message: error.message
  });
  return Promise.reject(error);
});

// 认证相关API
export const authAPI = {
  // 用户注册
  register: (data: { username: string; password: string; role: string }) => 
    api.post('/auth/register', data),
  
  // 用户登录
  login: (data: { username: string; password: string }) => 
    api.post('/auth/login', data),
  
  // 获取当前用户信息
  getMe: () => api.get('/auth/me'),
  
  // 获取用户列表（管理员）
  getUsers: () => api.get('/auth/users'),
  
  // 修改用户状态（管理员）
  updateUserStatus: (data: { id: string; status: string }) => 
    api.put('/auth/users/status', data),
};

// 项目相关API
export const projectAPI = {
  // 创建项目
  create: (data: any) => api.post('/projects', data),
  
  // 获取项目列表
  getList: () => api.get('/projects'),
  
  // 获取项目详情
  getById: (id: string) => api.get(`/projects/${id}`),
  
  // 更新项目
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  
  // 删除项目
  delete: (id: string) => api.delete(`/projects/${id}`),
  
  // 批量删除项目
  batchDelete: (ids: string[]) => api.post('/projects/batch-delete', { ids }),
  
  // 更新项目状态
  updateStatus: (id: string, status: string) => 
    api.put(`/projects/${id}/status`, { status }),
};

// 人员记录相关API
export const personnelAPI = {
  // 创建人员记录
  create: (data: any) => api.post('/personnel', data),
  
  // 批量创建人员记录
  batchCreate: (data: any[]) => api.post('/personnel/batch', data),
  
  // 获取人员记录列表
  getList: () => api.get('/personnel'),
  
  // 获取项目相关的人员记录
  getByProjectId: (projectId: string) => 
    api.get(`/personnel/project/${projectId}`),
  
  // 获取人员记录详情
  getById: (id: string) => api.get(`/personnel/${id}`),
  
  // 更新人员记录
  update: (id: string, data: any) => api.put(`/personnel/${id}`, data),
  
  // 删除人员记录
  delete: (id: string) => api.delete(`/personnel/${id}`),
  
  // 批量删除人员记录
  batchDelete: (ids: string[]) => api.post('/personnel/batch-delete', { ids }),
};

// 评分配置相关API
export const configAPI = {
  // 获取评分配置
  getScoringConfig: () => api.get('/config/scoring'),
  
  // 更新评分配置（管理员）
  updateScoringConfig: (data: any) => api.put('/config/scoring', data),
};

export default api;