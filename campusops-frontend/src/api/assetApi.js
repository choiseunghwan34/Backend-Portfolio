import client from './client';

export const assetApi = {
  list: () => client.get('/api/assets'),
  detail: (assetNo) => client.get(`/api/assets/${assetNo}`),
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
