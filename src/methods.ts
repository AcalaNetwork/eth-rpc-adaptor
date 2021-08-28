import { MethodMapping } from '@open-rpc/server-js/build/router';
import { Eip1193Bridge } from './eip1193-bridge';
import { EvmRpcProvider } from './evm-rpc-provider';

export const createMethodMapping = async (): Promise<MethodMapping> => {
  const provider = new EvmRpcProvider();

  await provider.isReady();

  const bridge = new Eip1193Bridge(provider);

  return {
    eth_chainId: () => bridge.send('eth_chainId'),
  };
};
