import api from './api';

export const clothingService = {
  async getAll(params = {}) {
    const response = await api.get('/clothing', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/clothing/${id}`);
    return response.data;
  },

  async create(formDataOrData) {
    // If formDataOrData is FormData, send multipart header
    const isFormData = formDataOrData instanceof FormData;
    const response = await api.post('/clothing', formDataOrData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  async update(id, formDataOrData) {
    const isFormData = formDataOrData instanceof FormData;
    const response = await api.put(`/clothing/${id}`, formDataOrData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/clothing/${id}`);
    return response.data;
  },

  async toggleFavorite(id) {
    const response = await api.patch(`/clothing/${id}/favorite`);
    return response.data;
  },
};

