import { MethodMapping } from "@open-rpc/server-js/build/router";
import { chainId } from "./chainid";

export const methodMapping: MethodMapping = {
  eth_chainId: chainId,
};

export default methodMapping;
