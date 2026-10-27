import api from './api';

export const wishlistService = {
  async getAll(params = {}) {
    const response = await api.get('/wishlist', { params });
    return response.data;
  },

  async create(itemData) {
    const response = await api.post('/wishlist', itemData);
    return response.data;
  },

  async update(id, itemData) {
    const response = await api.put(`/wishlist/${id}`, itemData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/wishlist/${id}`);
    return response.data;
  },

  async convertToWardrobe(id, options = {}) {
    const response = await api.post(`/wishlist/${id}/convert`, options);
    return response.data;
  },
};

