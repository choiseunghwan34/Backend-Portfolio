import client from './client';

export const assetApi = {
  list: (config = {}) => client.get('/api/assets', config),
  detail: (assetNo, config = {}) => client.get(`/api/assets/${assetNo}`, config),
  rent: (assetNo, payload) => client.post(`/api/assets/${assetNo}/rentals`, payload),
  myRentals: () => client.get('/api/rentals/my'),
  create: (payload) => client.post('/api/admin/assets', payload),
  update: (assetNo, payload) => client.put(`/api/admin/assets/${assetNo}`, payload),
  disable: (assetNo) => client.patch(`/api/admin/assets/${assetNo}/disable`),
  rentals: () => client.get('/api/admin/assets/rentals'),
  approve: (rentalNo) => client.patch(`/api/admin/assets/rentals/${rentalNo}/approve`),
  reject: (rentalNo) => client.patch(`/api/admin/assets/rentals/${rentalNo}/reject`),
  returnRental: (rentalNo) => client.patch(`/api/admin/assets/rentals/${rentalNo}/return`)
};
