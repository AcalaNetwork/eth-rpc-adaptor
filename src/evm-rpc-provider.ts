import { options } from '@acala-network/api';
import type { EvmAccountInfo, EvmContractInfo } from '@acala-network/types/interfaces';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { hexlify, isHexString } from '@ethersproject/bytes';
import { Deferrable, resolveProperties } from '@ethersproject/properties';
import { accessListify, Transaction } from '@ethersproject/transactions';
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import { InvalidParams, UnsupportedParams } from './errors';

export type BlockTag = 'earliest' | 'latest' | 'pending' | string | number;

export class EvmRpcProvider {
  readonly #api: ApiPromise;

  constructor(endpoint?: string | string[]) {
    this.#api = new ApiPromise(
      options({
        types: {
          AtLeast64BitUnsigned: 'u128',
          EvmAccountInfo: {
            nonce: 'Index',
            contractInfo: 'Option<EvmContractInfo>',
            developerDeposit: 'Option<Balance>',
          },
          EvmContractInfo: {
            codeHash: 'H256',
            maintainer: 'H160',
            deployed: 'bool',
          },
        },
        provider: new WsProvider(endpoint),
      })
    );
  }

  get genesisHash() {
    return this.#api.genesisHash.toHex();
  }

  get isConnected() {
    return this.#api.isConnected;
  }

  isReady = async () => {
    try {
      await this.#api.isReadyOrError;
    } catch (e) {
      await this.#api.disconnect();
      throw e;
    }
  };

  disconnect = async () => {
    await this.#api.disconnect();
  };

  chainId = async (): Promise<number> => {
    return 1337;
  };

  getBlockNumber = async (): Promise<number> => {
    // const hash = await this.#api.rpc.chain.getFinalizedHead();
    // const header = await this.#api.rpc.chain.getHeader(hash);

    const header = await this.#api.rpc.chain.getHeader();

    return header.number.toNumber();
  };

  getTransactionCount = async (
    addressOrName: string | Promise<string>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<number> => {
    const accountInfo = await this.queryAccountInfo(addressOrName, blockTag);

    return !accountInfo.isNone ? accountInfo.unwrap().nonce.toNumber() : 0;
  };

  getCode = async (
    addressOrName: string | Promise<string>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<string> => {
    const { address, blockHash } = await resolveProperties({
      address: this._getAddress(addressOrName),
      blockHash: this._getBlockTag(blockTag),
    });

    const contractInfo = await this.queryContractInfo(address, blockHash);

    if (contractInfo.isNone) {
      return '0x';
    }

    const codeHash = contractInfo.unwrap().codeHash;

    const code = blockHash
      ? await this.#api.query.evm.codes.at(blockHash, codeHash)
      : await this.#api.query.evm.codes(codeHash);

    return code.toHex();
  };

  // pub from: Option<H160>,
  // pub to: Option<H160>,
  // pub gas_limit: Option<u64>,
  // pub storage_limit: Option<u32>,
  // pub value: Option<NumberOrHex>,
  // pub data: Option<Bytes>,
  call = async (
    transaction: Deferrable<TransactionRequest>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<string> => {
    const resolved = await resolveProperties({
      transaction: this._getTransactionRequest(transaction),
      blockHash: this._getBlockTag(blockTag),
    });

    const callRequest = {
      from: resolved.transaction.from,
      to: resolved.transaction.to,
      gasLimit: resolved.transaction.gasLimit?.toBigInt(),
      storage_limit: undefined,
      value: resolved.transaction.value?.toBigInt(),
      data: resolved.transaction.data,
    };

    console.log('callRequest', callRequest)
    const data = resolved.blockHash
      ? await (this.#api.rpc as any).evm.call(callRequest, resolved.blockHash)
      : await (this.#api.rpc as any).evm.call(callRequest);

    return data.toHex();
  };

  queryAccountInfo = async (
    addressOrName: string | Promise<string>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<Option<EvmAccountInfo>> => {
    const { address, blockHash } = await resolveProperties({
      address: this._getAddress(addressOrName),
      blockHash: this._getBlockTag(blockTag),
    });

    const accountInfo = blockHash
      ? await this.#api.query.evm.accounts.at<Option<EvmAccountInfo>>(blockHash, address)
      : await this.#api.query.evm.accounts<Option<EvmAccountInfo>>(address);

    return accountInfo;
  };

  queryContractInfo = async (
    addressOrName: string | Promise<string>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<Option<EvmContractInfo>> => {
    const accountInfo = await this.queryAccountInfo(addressOrName, blockTag);

    if (accountInfo.isNone) {
      return this.#api.createType<Option<EvmContractInfo>>('Option<EvmContractInfo>', null);
    }

    return accountInfo.unwrap().contractInfo;
  };

  _getBlockTag = async (blockTag?: BlockTag | Promise<BlockTag>): Promise<string | undefined> => {
    blockTag = await blockTag;

    if (blockTag === undefined) return blockTag;

    switch (blockTag) {
      case 'pending': {
        throw new UnsupportedParams('unsupport pending BlockTag');
      }
      case 'latest': {
        const hash = await this.#api.rpc.chain.getFinalizedHead();
        return hash.toHex();
      }
      case 'earliest': {
        const hash = this.#api.genesisHash;
        return hash.toHex();
      }
      default: {
        if (!isHexString(blockTag)) {
          throw new InvalidParams('blocktag should be a hex string');
        }

        // block hash
        if (typeof blockTag === 'string' && isHexString(blockTag, 32)) {
          return blockTag;
        }

        const blockNumber = BigNumber.from(blockTag).toNumber();

        const hash = await this.#api.query.system.blockHash(blockNumber);

        return hash.toHex();
      }
    }
  };

  _getAddress = async (addressOrName: string | Promise<string>): Promise<string> => {
    addressOrName = await addressOrName;
    return addressOrName;
  };

  _getTransactionRequest = async (transaction: Deferrable<TransactionRequest>): Promise<Transaction> => {
    const values: any = await transaction;

    const tx: any = {};

    ['from', 'to'].forEach((key) => {
      if (values[key] == null) {
        return;
      }
      tx[key] = Promise.resolve(values[key]).then((v) => (v ? this._getAddress(v) : null));
    });

    ['gasLimit', 'gasPrice', 'maxFeePerGas', 'maxPriorityFeePerGas', 'value'].forEach((key) => {
      if (values[key] == null) {
        return;
      }
      tx[key] = Promise.resolve(values[key]).then((v) => (v ? BigNumber.from(v) : null));
    });

    ['type'].forEach((key) => {
      if (values[key] == null) {
        return;
      }
      tx[key] = Promise.resolve(values[key]).then((v) => (v != null ? v : null));
    });

    if (values.accessList) {
      tx.accessList = accessListify(values.accessList);
    }

    ['data'].forEach((key) => {
      if (values[key] == null) {
        return;
      }
      tx[key] = Promise.resolve(values[key]).then((v) => (v ? hexlify(v) : null));
    });

    return await resolveProperties(tx);
  };
}