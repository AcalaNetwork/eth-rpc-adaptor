import { createApi } from './api';

const endpoint = 'ws://192.168.50.20:9944';

describe('createApi', () => {
  it('createApi', async () => {
    const api = await createApi(endpoint);
    expect(api.isConnected).toBeTruthy();
  });
});
