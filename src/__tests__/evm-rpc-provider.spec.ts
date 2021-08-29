import { EvmRpcProvider } from '../evm-rpc-provider';

const endpoint = 'wss://mandala6.laminar.codes/';

describe('EvmRpcProvider', () => {
  it('connect chain', async () => {
    const provider = new EvmRpcProvider(endpoint);
    await provider.isReady();
    expect(provider.isConnected).toBeTruthy();
    await provider.disconnect();
  });

  it('connect random', async () => {
    try {
      const provider = new EvmRpcProvider('ws://192.-');
      await provider.isReady();
    } catch (e) {
      expect((e as any).type).toEqual('error');
    }
  });
});
