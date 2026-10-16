import api from './api';

export const getNotifications = async () => {
  return await api.get('/notifications');
};

export const markNotificationAsRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return await api.patch('/notifications/read-all');
};
