import { Eip1193Bridge } from './eip1193-bridge';
import { logger } from './logger';

export class Router {
  readonly #bridge: Eip1193Bridge;

  constructor(bridge: Eip1193Bridge) {
    this.#bridge = bridge;
  }

  public async call(methodName: string, params: unknown[]) {
    try {
      return { result: await this.#bridge.send(methodName, params) };
    } catch (e) {
      // if (e instanceof JSONRPCError) {
      //   return { error: { code: e.code, message: e.message, data: e.data } };
      // }
      return { error: { code: 6969, message: 'unknown error' } };
    }
  }

  public isMethodImplemented(methodName: string): boolean {
    return this.#bridge.isMethodImplemented(methodName);
  }
}
