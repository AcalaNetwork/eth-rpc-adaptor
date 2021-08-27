import { ApiPromise, WsProvider } from '@polkadot/api';
import { options } from '@acala-network/api';

let api: ApiPromise;

export const createApi = async (endpoint?: string | string[]) => {
  if (!api) {
    api = new ApiPromise(
      options({
        provider: new WsProvider(endpoint),
      })
    );
  }

  try {
    await api.isReadyOrError;
  } catch (err) {
    api.disconnect();
    throw err;
  }

  return api;
};
