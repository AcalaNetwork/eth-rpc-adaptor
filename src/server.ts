import HTTPServerTransport from '@open-rpc/server-js/build/transports/http';
import WebSocketServerTransport from '@open-rpc/server-js/build/transports/websocket';
import dotenv from 'dotenv';
import { Eip1193Bridge } from './eip1193-bridge';
import { EvmRpcProvider } from './evm-rpc-provider';
import { Router } from './router';
import { rpcLog } from './logger';

dotenv.config();

export async function start() {
  const ENDPOINT_URL = process.env.ENDPOINT_URL;
  if (!ENDPOINT_URL) {
    throw new Error('ENDPOINT_URL is not defined');
  }
  const provider = new EvmRpcProvider(ENDPOINT_URL);

  const bridge = new Eip1193Bridge(provider);

  const router = new Router(bridge);

  const HTTPTransport = new HTTPServerTransport({
    port: 3330,
    middleware: [rpcLog],
  });

  const WebSocketTransport = new WebSocketServerTransport({
    port: 3331,
    middleware: [rpcLog],
  });

  HTTPTransport.addRouter(router as any);
  WebSocketTransport.addRouter(router as any);

  HTTPTransport.start();
  WebSocketTransport.start();

  console.log('Starting Server, HTTP: 3330, WS: 3331');

  await provider.isReady();
}
