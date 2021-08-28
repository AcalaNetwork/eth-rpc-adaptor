import { ApiPromise, WsProvider } from '@polkadot/api';
import { options } from '@acala-network/api';
export class EvmRpcProvider {
  readonly #api: ApiPromise;

  constructor(endpoint?: string | string[]) {
    this.#api = new ApiPromise(
      options({
        types: {
          AtLeast64BitUnsigned: 'u128',
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
    const hash = await this.#api.rpc.chain.getFinalizedHead();
    const header = await this.#api.rpc.chain.getHeader(hash);

    return header.number.toNumber();
  };
}
