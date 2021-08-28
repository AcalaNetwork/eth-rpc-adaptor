import { ApiPromise, WsProvider } from '@polkadot/api';
import { options } from '@acala-network/api';

let api: ApiPromise;

export const createApi = async (endpoint?: string | string[]) => {
  if (!api) {
    api = new ApiPromise(
      options({
        types: {
          AtLeast64BitUnsigned: 'u128',
        },
        provider: new WsProvider(endpoint),
      })
    );
  }

  try {
    await api.isReadyOrError;
  } catch (err) {
    await api.disconnect();
    throw err;
  }

  return api;
};
