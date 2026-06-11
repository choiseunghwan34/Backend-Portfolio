import client from './client';

export const roomApi = {
  list: () => client.get('/api/rooms'),
  detail: (roomNo) => client.get(`/api/rooms/${roomNo}`),
  reservations: (roomNo) => client.get(`/api/rooms/${roomNo}/reservations`),
  reserve: (roomNo, payload) => client.post(`/api/rooms/${roomNo}/reservations`, payload),
  myReservations: () => client.get('/api/reservations/my'),
  cancel: (reservationNo) => client.delete(`/api/reservations/${reservationNo}`),
  create: (payload) => client.post('/api/admin/rooms', payload),
  update: (roomNo, payload) => client.put(`/api/admin/rooms/${roomNo}`, payload),
  disable: (roomNo) => client.patch(`/api/admin/rooms/${roomNo}/disable`),
  adminReservations: () => client.get('/api/admin/rooms/reservations')
};
