import { options } from '@acala-network/api';
import type { EvmAccountInfo, EvmContractInfo } from '@acala-network/types/interfaces';
import { BigNumber } from '@ethersproject/bignumber';
import { isHexString } from '@ethersproject/bytes';
import { resolveProperties } from '@ethersproject/properties';
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Option, Bytes } from '@polkadot/types';
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
    return 42;
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

  call = async (): Promise<number> => {
    return 0;
    // abstract call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
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
      return this.#api.createType<Option<EvmContractInfo>>('<Option<EvmContractInfo>>', null);
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
}
