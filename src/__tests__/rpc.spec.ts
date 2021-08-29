import { EvmRpcProvider } from '../evm-rpc-provider';

const endpoint = 'ws://192.168.50.20:9944';

const provider = new EvmRpcProvider(endpoint);

describe('rpc test', () => {
  beforeAll(async () => {
    await provider.isReady();
  });

  afterAll(async () => {
    await provider.disconnect();
  });

  it('chainId', async () => {
    const result = await provider.chainId();
    expect(result).toBeDefined();
  });

  it('getTransactionCount', async () => {
    const result = await provider.getTransactionCount('0x33f9440ff970496a09e391f3773a66f1e98eb13c', 'latest');
    expect(result).toBeDefined();
  });

  it('getCode', async () => {
    const result = await provider.getCode('0x0000000000000000000000000000000000000802');
    console.log(result);
    expect(result).toBeDefined();
  });
});
