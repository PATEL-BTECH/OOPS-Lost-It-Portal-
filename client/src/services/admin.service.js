import api from './api';

export const getAnalytics = async () => {
  return await api.get('/admin/analytics');
};

export const getUsers = async (params = {}) => {
  return await api.get('/admin/users', { params });
};

export const updateUserRole = async (userId, role) => {
  return await api.patch(`/admin/users/${userId}/role`, { role });
};

export const toggleUserBlock = async (userId) => {
  return await api.patch(`/admin/users/${userId}/block`);
};

export const getAuditLogs = async () => {
  return await api.get('/admin/audit-logs');
};

export const getAnnouncements = async () => {
  return await api.get('/admin/announcements');
};

export const createAnnouncement = async (data) => {
  return await api.post('/admin/announcements', data);
};

export const deleteAnnouncement = async (id) => {
  return await api.delete(`/admin/announcements/${id}`);
};
