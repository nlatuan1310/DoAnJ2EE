import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mocking current user ID (In real app, this would come from auth store)
export const CURRENT_USER_ID = '930058b8-07e3-4d64-9040-41372cf9335f'; 

export const danhMucApi = {
  getAll: (nguoiDungId: string = CURRENT_USER_ID) => 
    api.get(`/danh-muc/nguoi-dung/${nguoiDungId}`),
  
  getByLoai: (loai: 'thu' | 'chi', nguoiDungId: string = CURRENT_USER_ID) => 
    api.get(`/danh-muc/nguoi-dung/${nguoiDungId}/loai/${loai}`),
    
  create: (data: any, nguoiDungId: string = CURRENT_USER_ID) => 
    api.post(`/danh-muc/nguoi-dung/${nguoiDungId}`, data),
    
  update: (id: number, data: any, nguoiDungId: string = CURRENT_USER_ID) => 
    api.put(`/danh-muc/${id}/nguoi-dung/${nguoiDungId}`, data),
    
  delete: (id: number, nguoiDungId: string = CURRENT_USER_ID) => 
    api.delete(`/danh-muc/${id}/nguoi-dung/${nguoiDungId}`),
};

export const theTagApi = {
  getAll: (nguoiDungId: string = CURRENT_USER_ID) => 
    api.get(`/the-tag/nguoi-dung/${nguoiDungId}`),
    
  create: (data: any, nguoiDungId: string = CURRENT_USER_ID) => 
    api.post(`/the-tag/nguoi-dung/${nguoiDungId}`, data),
    
  update: (id: number, data: any, nguoiDungId: string = CURRENT_USER_ID) => 
    api.put(`/the-tag/${id}/nguoi-dung/${nguoiDungId}`, data),
    
  delete: (id: number, nguoiDungId: string = CURRENT_USER_ID) => 
    api.delete(`/the-tag/${id}/nguoi-dung/${nguoiDungId}`),
};

export default api;
