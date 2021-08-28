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
    await this.#api.isReadyOrError;
  };

  disconnect = async () => {
    await this.#api.disconnect();
  };

  chainId = async () => {
    return '0';
  };

  blockNumber = async () => {
    return '0';
  };
}
