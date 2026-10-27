import api from './api';

export const communityService = {
  async getFeed(params = {}) {
    const response = await api.get('/community', { params });
    return response.data;
  },

  async createPost(postData) {
    const response = await api.post('/community', postData);
    return response.data;
  },

  async deletePost(id) {
    const response = await api.delete(`/community/${id}`);
    return response.data;
  },

  async toggleLike(id) {
    const response = await api.post(`/community/${id}/like`);
    return response.data;
  },
};

