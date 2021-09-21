import EventEmitter from 'events';
import { hexValue, isHexString } from '@ethersproject/bytes';
import { EvmRpcProvider } from './evm-rpc-provider';
import { logger } from './logger';
import { BigNumber } from '@ethersproject/bignumber';

const hexlifyRpcResult = (data: unknown): any => {
  if (data === null || data === undefined) return data;
  if (typeof data === 'boolean') return data;

  if (BigNumber.isBigNumber(data)) {
    return data.toHexString();
  }

  if (Array.isArray(data)) {
    return data.map((item) => {
      return hexlifyRpcResult(item);
    });
  }

  if (data && typeof data === 'object') {
    const keys = Object.keys(data);
    const result: any = {};

    for (const key of keys) {
      result[key] = hexlifyRpcResult((data as any)[key]);
    }

    return result;
  }

  if (typeof data === 'number') {
    return hexValue(data as any);
  }

  if (isHexString(data)) {
    return data;
  }

  return data;
};

export class Eip1193Bridge extends EventEmitter {
  readonly #provider: EvmRpcProvider;

  constructor(provider: EvmRpcProvider) {
    super();
    this.#provider = provider;
  }

  request(request: { method: string; params?: Array<any> }): Promise<any> {
    return this.send(request.method, request.params || []);
  }

  async send(method: string, params?: Array<any>): Promise<any> {
    switch (method) {
      case 'net_version': {
        return this.#provider.netVersion();
      }
      case 'eth_blockNumber': {
        const number = await this.#provider.getBlockNumber();
        return hexValue(number);
      }
      case 'eth_chainId': {
        const chainId = await this.#provider.chainId();
        return hexValue(chainId);
      }
      case 'eth_getTransactionCount': {
        const count = await this.#provider.getTransactionCount(params?.[0], params?.[1]);
        return hexValue(count);
      }
      case 'eth_getCode': {
        const code = await this.#provider.getCode(params?.[0], params?.[1]);
        return code;
      }
      case 'eth_call': {
        return this.#provider.call(params?.[0], params?.[1]);
      }
      case 'eth_getBalance': {
        const balance = await this.#provider.getBalance(params?.[0], params?.[1]);
        return hexlifyRpcResult(balance);
      }

      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber': {
        if (params?.[0] === undefined) return null;

        const block = await this.#provider.getBlock(params?.[0], params?.[1]);

        return hexlifyRpcResult(block);
      }

      case 'eth_gasPrice':
      case 'eth_accounts':
      case 'eth_getStorageAt':

      case 'eth_getBlockTransactionCountByHash':
      case 'eth_getBlockTransactionCountByNumber':

      case 'eth_sendRawTransaction':
      case 'eth_estimateGas':

      case 'eth_getTransactionByHash':
      case 'eth_getTransactionReceipt':
      case 'eth_sign':
      case 'eth_sendTransaction':
      case 'eth_getUncleCountByBlockHash':
      case 'eth_getUncleCountByBlockNumber':
      case 'eth_getTransactionByBlockHashAndIndex':
      case 'eth_getTransactionByBlockNumberAndIndex':
      case 'eth_getUncleByBlockHashAndIndex':
      case 'eth_getUncleByBlockNumberAndIndex':
      case 'eth_newFilter':
      case 'eth_newBlockFilter':
      case 'eth_newPendingTransactionFilter':
      case 'eth_uninstallFilter':
      case 'eth_getFilterChanges':
      case 'eth_getFilterLogs':
      case 'eth_getLogs':
        break;
    }

    throw new Error(`unsupported method: ${method}`);
  }
}
