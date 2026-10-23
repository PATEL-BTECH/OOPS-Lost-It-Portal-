import api from './api';

export const getLockers = async () => {
  return await api.get('/lockers');
};

export const getCustodyLocations = async () => {
  const res = await api.get('/lockers/custody-locations');
  return res.locations || [];
};

export const assignLocker = async ({ lockerId, foundItemId, custodyLocationId, notes }) => {
  return await api.post('/lockers/assign', { lockerId, foundItemId, custodyLocationId, notes });
};

export const vacateLocker = async (lockerId, { reason }) => {
  return await api.post(`/lockers/${lockerId}/vacate`, { reason });
};
