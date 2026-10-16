import api from './api';

export const getItemMatches = async (itemId, type = 'lost') => {
  const response = await api.get(`/matches/item/${itemId}?type=${type}`);
  return response.matches || [];
};

export const getMyMatches = async () => {
  const response = await api.get('/matches/my');
  return response.matches || [];
};

export const dismissMatch = async (matchId) => {
  return await api.patch(`/matches/${matchId}/dismiss`);
};
