import axiosInstance from '../utils/axiosInstance';

/**
 * Service handling user profiles operations
 */
export const userService = {
  updateProfile: async (payload) => {
    const response = await axiosInstance.patch('/users/profile', payload);
    return response.data.data;
  },

  deleteAccount: async () => {
    const response = await axiosInstance.delete('/users/account');
    return response.data;
  },

  uploadProfilePicture: async (formData) => {
    const response = await axiosInstance.post('/uploads/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }
};

export default userService;
