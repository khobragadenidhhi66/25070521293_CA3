import api from './api';

export const outfitService = {
  async getAll(params = {}) {
    const response = await api.get('/outfits', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/outfits/${id}`);
    return response.data;
  },

  async create(outfitData) {
    const response = await api.post('/outfits', outfitData);
    return response.data;
  },

  async update(id, outfitData) {
    const response = await api.put(`/outfits/${id}`, outfitData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/outfits/${id}`);
    return response.data;
  },

  async toggleFavorite(id) {
    const response = await api.patch(`/outfits/${id}/favorite`);
    return response.data;
  },
};

