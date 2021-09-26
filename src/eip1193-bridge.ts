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
  readonly #impl: Eip1193BridgeImpl;

  constructor(provider: EvmRpcProvider) {
    super();
    this.#impl = new Eip1193BridgeImpl(provider);
  }

  request(request: { method: string; params?: Array<any> }): Promise<any> {
    return this.send(request.method, request.params || []);
  }

  isMethodValid(method: string): boolean {
    return method.startsWith('eth_') || method.startsWith('net_') || method.startsWith('web3_');
  }

  isMethodImplemented(method: string): method is keyof Eip1193BridgeImpl {
    return this.isMethodValid(method) && method in this.#impl;
  }

  async send(method: string, params: any[] = []): Promise<any> {
    if (this.isMethodImplemented(method)) {
      // isMethodImplemented ensuress this cannot be used to access other unrelated methods
      return this.#impl[method](params);
    }
    throw new Error(`unsupported method: ${method}`);
  }
}

class Eip1193BridgeImpl {
  readonly #provider: EvmRpcProvider;

  constructor(provider: EvmRpcProvider) {
    this.#provider = provider;
  }

  async web3_clientVersion(): Promise<string> {
    return 'Acala/v0.0.1';
  }

  async net_version(): Promise<any> {
    return this.#provider.netVersion();
  }

  async eth_blockNumber(): Promise<any> {
    const number = await this.#provider.getBlockNumber();
    return hexValue(number);
  }

  async eth_chainId() {
    const chainId = await this.#provider.chainId();
    return hexValue(chainId);
  }

  async eth_getTransactionCount(params: any[]): Promise<any> {
    const count = await this.#provider.getTransactionCount(params[0], params[1]);
    return hexValue(count);
  }

  async eth_getCode(params: any[]): Promise<any> {
    return this.#provider.getCode(params[0], params[1]);
  }

  async eth_call(params: any[]): Promise<any> {
    return this.#provider.call(params[0], params[1]);
  }

  async eth_getBalance(params: any[]): Promise<any> {
    const balance = await this.#provider.getBalance(params[0], params[1]);
    return hexlifyRpcResult(balance);
  }

  async eth_getBlockByHash(params: any[]): Promise<any> {
    if (params?.[0] === undefined) return null;

    const block = await this.#provider.getBlock(params[0], params[1]);

    return hexlifyRpcResult(block);
  }

  async eth_getBlockByNumber(params: any[]): Promise<any> {
    return this.eth_getBlockByHash(params);
  }

  // async eth_gasPrice(params: any[]): Promise<any> {

  // }

  // async eth_accounts(params: any[]): Promise<any> {

  // }

  // async eth_getStorageAt(params: any[]): Promise<any> {

  // }

  // async eth_getBlockTransactionCountByHash(params: any[]): Promise<any> {

  // }

  // async eth_getBlockTransactionCountByNumber(params: any[]): Promise<any> {

  // }

  async eth_sendRawTransaction(params: any[]): Promise<any> {
    const tx = params[0];
    return this.#provider.sendRawTransaction(tx);
  }

  async eth_estimateGas(params: any[]): Promise<any> {
    // @TODO
    return 1000000;
  }

  // async eth_getTransactionByHash(params: any[]): Promise<any> {

  // }

  // async eth_getTransactionReceipt(params: any[]): Promise<any> {

  // }

  // async eth_sign(params: any[]): Promise<any> {

  // }

  // async eth_sendTransaction(params: any[]): Promise<any> {

  // }

  // async eth_getUncleCountByBlockHash(params: any[]): Promise<any> {

  // }

  // async eth_getUncleCountByBlockNumber(params: any[]): Promise<any> {

  // }

  // async eth_getTransactionByBlockHashAndIndex(params: any[]): Promise<any> {

  // }

  // async eth_getTransactionByBlockNumberAndIndex(params: any[]): Promise<any> {

  // }

  // async eth_getUncleByBlockHashAndIndex(params: any[]): Promise<any> {

  // }

  // async eth_getUncleByBlockNumberAndIndex(params: any[]): Promise<any> {

  // }

  // async eth_newFilter(params: any[]): Promise<any> {

  // }

  // async eth_newBlockFilter(params: any[]): Promise<any> {

  // }

  // async eth_newPendingTransactionFilter(params: any[]): Promise<any> {

  // }

  // async eth_uninstallFilter(params: any[]): Promise<any> {

  // }

  // async eth_getFilterChanges(params: any[]): Promise<any> {

  // }

  // async eth_getFilterLogs(params: any[]): Promise<any> {

  // }

  // async eth_getLogs(params: any[]): Promise<any> {

  // }
}
