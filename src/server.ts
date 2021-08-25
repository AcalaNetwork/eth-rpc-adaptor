import { Server, ServerOptions } from "@open-rpc/server-js";
import { HTTPServerTransportOptions } from "@open-rpc/server-js/build/transports/http";
import { WebSocketServerTransportOptions } from "@open-rpc/server-js/build/transports/websocket";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import methodMapping from "./methods";
import doc from "./rpc.json";

export async function start() {
  const serverOptions: ServerOptions = {
    openrpcDocument: await parseOpenRPCDocument(doc as OpenrpcDocument),
    transportConfigs: [
      {
        type: "HTTPTransport",
        options: {
          port: 3330,
          middleware: [],
        } as HTTPServerTransportOptions,
      },
      {
        type: "WebSocketTransport",
        options: {
          port: 3331,
          middleware: [],
        } as WebSocketServerTransportOptions,
      },
    ],
    methodMapping,
  };

  console.log("Starting Server");
  
  const s = new Server(serverOptions);

  s.start();
}
