import apiClient from '../client';

export const authService = {
  login: async (credentials: { email: string; password?: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('genzura_token', response.data.token);
    }
    return response.data;
  },

  register: async (data: any) => {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('genzura_token', response.data.token);
    }
    return response.data;
  },

  sendOtp: async (email: string) => {
    const response = await apiClient.post('/auth/send-otp', { email });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeAvatar: async () => {
    const response = await apiClient.delete('/users/avatar');
    return response.data;
  },

  deleteAccount: async (password: string, confirmText: string) => {
    const response = await apiClient.post('/auth/delete-account', {
      password,
      confirmText,
    });
    // Clear token after successful deletion
    localStorage.removeItem('genzura_token');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('genzura_token');
  },
};
