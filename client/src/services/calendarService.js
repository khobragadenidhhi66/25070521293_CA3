import api from './api';

export const calendarService = {
  async getPlans(params = {}) {
    const response = await api.get('/calendar', { params });
    return response.data;
  },

  async createPlan(planData) {
    const response = await api.post('/calendar', planData);
    return response.data;
  },

  async updatePlan(id, planData) {
    const response = await api.put(`/calendar/${id}`, planData);
    return response.data;
  },

  async deletePlan(id) {
    const response = await api.delete(`/calendar/${id}`);
    return response.data;
  },
};

