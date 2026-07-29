import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
  login: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: data.email,
        password: data.password
      });
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  },

  signup: async (data) => {
    try {
      const payload = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
        password: data.password
      };
      const response = await axios.post(`${API_URL}/register`, payload);
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create account');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/request-password-reset`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to request password reset');
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};
