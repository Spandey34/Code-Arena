import API from './api';

export const login = async (email, password) => {
  try {
    const response = await API.post('/user/login', { email, password });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error('Login failed');
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await API.post('/user/register', { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
    await API.post('/user/logout');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.isAdmin === true;
};