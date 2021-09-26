export class JSONRPCError extends Error {
  public code: number;
  public message: string;
  public data?: any;
  readonly _isJSONRPCError: true;

  constructor(message: string, code: number, data?: any) {
    super();
    this.code = code;
    this.message = message;
    this.data = data;
    this._isJSONRPCError = true;
  }

  static isJSONRPCError(obj: any): obj is JSONRPCError {
    return obj._isJSONRPCError;
  }
}

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
