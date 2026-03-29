import api, { getCurrentUserId } from './api';

export const subscriptionService = {
  getAll: (nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/dang-ky-dich-vu/nguoi-dung/${uid}`);
  },

  getDueSoon: (days: number = 7) => {
    return api.get(`/dang-ky-dich-vu/sap-den-han?days=${days}`);
  },

  getById: (id: string) => {
    return api.get(`/dang-ky-dich-vu/${id}`);
  },

  create: (viId: string, danhMucId: number, data: any, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.post(`/dang-ky-dich-vu?nguoiDungId=${uid}&viId=${viId}&danhMucId=${danhMucId}`, data);
  },

  update: (id: string, data: any) => {
    return api.put(`/dang-ky-dich-vu/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/dang-ky-dich-vu/${id}`);
  },
};

export default subscriptionService;
