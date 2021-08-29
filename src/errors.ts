import { JSONRPCError } from '@open-rpc/server-js';

export class InvalidParams extends JSONRPCError {
  constructor(message: string) {
    super(message, -32602);
  }
}

export class UnsupportedParams extends JSONRPCError {
  constructor(message: string) {
    super(message, -32001);
  }
}
