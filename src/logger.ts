import pino from 'pino';
import pinoHttp from 'pino-http';
export const logger = pino();

export const rpcLog = pinoHttp({
  serializers: {
    req(req: any) {
      // req.body = req.raw.body;
      return {
        body: req.raw.body,
      };
    },
  },
});
