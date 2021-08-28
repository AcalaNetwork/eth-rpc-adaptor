import { EvmRpcProvider } from '../evm-rpc-provider';

const endpoint = 'ws://192.168.50.20:9944';

describe('EvmRpcProvider', () => {
  it('connect chain', async () => {
    const provider = new EvmRpcProvider(endpoint);
    await provider.isReady();
    expect(provider.isConnected).toBeTruthy();
    await provider.disconnect();
  });

  it('connect random', async () => {
    try {
      const provider = new EvmRpcProvider('ws://192.168.1.177:9944');
      await provider.isReady();
    } catch (e) {
      expect(e).toThrow();
    }
  });
});
