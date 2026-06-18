import client from './client';

export const homeApi = {
  summary: () => client.get('/api/home/summary')
};
