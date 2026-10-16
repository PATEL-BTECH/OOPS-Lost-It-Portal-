import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Build streaming photo URL for a GridFS photo ID
 */
export const getPhotoUrl = (photoId) => {
  if (!photoId) return null;
  return `${API_BASE_URL}/photos/${photoId}`;
};

// ==========================================
// Category Services
// ==========================================
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.categories || [];
};

// ==========================================
// Lost Item Services
// ==========================================
export const getLostItems = async (params = {}) => {
  return await api.get('/lost-items', { params });
};

export const getLostItemById = async (id) => {
  const response = await api.get(`/lost-items/${id}`);
  return response.item;
};

export const createLostItem = async (formData) => {
  return await api.post('/lost-items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getMyLostReports = async () => {
  const response = await api.get('/lost-items/my');
  return response.items || [];
};

export const deleteLostItem = async (id) => {
  return await api.delete(`/lost-items/${id}`);
};

// ==========================================
// Found Item Services
// ==========================================
export const getFoundItems = async (params = {}) => {
  return await api.get('/found-items', { params });
};

export const getFoundItemById = async (id) => {
  const response = await api.get(`/found-items/${id}`);
  return response.item;
};

export const createFoundItem = async (formData) => {
  return await api.post('/found-items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getMyFoundReports = async () => {
  const response = await api.get('/found-items/my');
  return response.items || [];
};

export const deleteFoundItem = async (id) => {
  return await api.delete(`/found-items/${id}`);
};
