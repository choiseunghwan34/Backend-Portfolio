import client from './client';

export const chatApi = {
  ask: (payload) => client.post('/api/chat', payload)
};
