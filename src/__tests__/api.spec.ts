import { createApi } from '../api';

const endpoint = 'ws://192.168.50.20:9944';

describe('createApi', () => {
  it('connect chain', async () => {
    const api = await createApi(endpoint);
    expect(api.isConnected).toBeTruthy();
    await api.disconnect();
  });

  it('connect random', async () => {
    try {
      await createApi('ws://192.168.1.177:9944');
    } catch (e) {
      expect(e).toThrow();
    }
  });
});
