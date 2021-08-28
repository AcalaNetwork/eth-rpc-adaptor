import EventEmitter from 'events';
import { hexValue } from '@ethersproject/bytes';
import { EvmRpcProvider } from './evm-rpc-provider';

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
      case 'eth_blockNumber': {
        const number = await this.#provider.getBlockNumber();
        return hexValue(number);
      }
      case 'eth_chainId': {
        const chainId = await this.#provider.chainId();
        return hexValue(chainId);
      }
      case 'eth_gasPrice':
      case 'eth_accounts':
      case 'eth_getBalance':
      case 'eth_getStorageAt':
      case 'eth_getTransactionCount':
      case 'eth_getBlockTransactionCountByHash':
      case 'eth_getBlockTransactionCountByNumber':
      case 'eth_getCode':
      case 'eth_sendRawTransaction':
      case 'eth_call':
      case 'eth_estimateGas':
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber':
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
