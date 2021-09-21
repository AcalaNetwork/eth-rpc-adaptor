import { MethodMapping } from '@open-rpc/server-js/build/router';
import { Eip1193Bridge } from './eip1193-bridge';
import { EvmRpcProvider } from './evm-rpc-provider';

export const createMethodMapping = async (): Promise<MethodMapping> => {
  const ENDPOINT_URL = process.env.ENDPOINT_URL;
  if (!ENDPOINT_URL) {
    throw new Error('ENDPOINT_URL is not defined');
  }
  const provider = new EvmRpcProvider(ENDPOINT_URL);

  await provider.isReady();

  const bridge = new Eip1193Bridge(provider);

  return {
    net_version: (...params) => {
      return bridge.send('net_version', params);
    },
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
    eth_getBalance: (...params) => {
      return bridge.send('eth_getBalance', params);
    },
    eth_getBlockByHash: (...params) => {
      return bridge.send('eth_getBlockByHash', params);
    },
    eth_getBlockByNumber: (...params) => {
      return bridge.send('eth_getBlockByNumber', params);
    },
  };
};
