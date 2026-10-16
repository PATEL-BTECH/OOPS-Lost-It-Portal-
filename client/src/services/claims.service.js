import api from './api';

export const createClaim = async (formData) => {
  return await api.post('/claims', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getMyClaims = async () => {
  const response = await api.get('/claims/my');
  return response.claims || [];
};

export const getClaims = async (params = {}) => {
  return await api.get('/claims', { params });
};

export const getClaimById = async (id) => {
  const response = await api.get(`/claims/${id}`);
  return response.claim;
};

export const reviewClaim = async (id, { status, decisionReason }) => {
  return await api.patch(`/claims/${id}/review`, { status, decisionReason });
};

export const recordHandover = async (id, { claimantIdProof, handoverNotes }) => {
  return await api.post(`/claims/${id}/handover`, { claimantIdProof, handoverNotes });
};
