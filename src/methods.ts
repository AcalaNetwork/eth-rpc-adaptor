import { MethodMapping } from '@open-rpc/server-js/build/router';
import { Eip1193Bridge } from './eip1193-bridge';
import { EvmRpcProvider } from './evm-rpc-provider';

export const createMethodMapping = async (): Promise<MethodMapping> => {
  const provider = new EvmRpcProvider('wss://mandala6.laminar.codes/');

  await provider.isReady();

  const bridge = new Eip1193Bridge(provider);

  return {
    eth_chainId: () => bridge.send('eth_chainId'),
    eth_blockNumber: () => bridge.send('eth_blockNumber'),
    eth_getTransactionCount: (...params) => {
      return bridge.send('eth_getTransactionCount', params);
    },
    eth_getCode: (...params) => {
      return bridge.send('eth_getCode', params);
    },
    eth_call: (...params) => {
      return bridge.send('eth_call', params);
    },
  };
};
