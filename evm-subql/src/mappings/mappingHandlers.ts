import type { EvmLog, H160 } from '@polkadot/types/interfaces/types';
import { SubstrateEvent } from '@subql/types';
import { Log, TransactionReceipt } from '../types';

const NOT_EXIST_TRANSACTION_INDEX = 0xffffffff;

export async function handleEvmEvent(event: SubstrateEvent): Promise<void> {
  const { block } = event;

  const txIdx = event.extrinsic?.idx ?? NOT_EXIST_TRANSACTION_INDEX;

  const createLog = async (receiptId: string, idx: number, evmLog: EvmLog) => {
    const log = Log.create({
      id: `${receiptId}-${idx}`,
      transactionHash: event.extrinsic.extrinsic.hash.toHex(),
      blockNumber: block.block.header.number.toNumber(),
      blockHash: block.block.hash,
      transactionIndex: event.phase.toNumber(),
      removed: false,
      address: evmLog.address.toString().toLowerCase(),
      data: evmLog.address.toString().toLowerCase(),
      topics: evmLog.topics.toJSON(),
      logIndex: idx,
      receiptId,
    });

    await log.save();
  };

  const processEvent = () => {
    switch (event.event.method) {
      case 'Created':
      case 'Executed': {
        const [evmAddress, logs] = event.event.data as unknown as [H160, EvmLog[]];

        return [
          TransactionReceipt.create({
            id: `${block.block.header.number.toString()}-${txIdx}`,
            to: evmAddress.toString(),
            from: '', // @Todo
            contractAddress: evmAddress.toString(),
            transactionIndex: txIdx,
            gasUsed: 0, // @Todo
            logsBloom: '0x', // @Todo
            blockHash: block.block.hash,
            transactionHash: event.extrinsic.extrinsic.hash.toHex(),
            blockNumber: block.block.header.number.toNumber(),
            confirmations: 4, // @Todo
            cumulativeGasUsed: 0, // @Todo
            byzantium: false,
            status: 1,
          }),
          logs,
        ] as [TransactionReceipt, EvmLog[]];
      }
      case 'CreatedFailed': {
        const [evmAddress, _exitReason, logs] = event.event.data as unknown as [H160, unknown, EvmLog[]];

        return [
          TransactionReceipt.create({
            id: `${block.block.header.number.toString()}-${event.extrinsic?.idx ?? NOT_EXIST_TRANSACTION_INDEX}`,
            to: evmAddress.toString(),
            from: '', // @Todo
            contractAddress: evmAddress.toString(),
            transactionIndex: event.phase.toNumber(),
            gasUsed: 0, // @Todo
            logsBloom: '0x', // @Todo
            blockHash: block.block.hash,
            transactionHash: event.extrinsic.extrinsic.hash.toHex(),
            blockNumber: block.block.header.number.toNumber(),
            confirmations: 4, // @Todo
            cumulativeGasUsed: 0, // @Todo
            byzantium: false,
            status: 0,
          }),
          logs,
        ] as [TransactionReceipt, EvmLog[]];
      }
      case 'ExecutedFailed': {
        const [evmAddress, _exitReason, _output, logs] = event.event.data as unknown as [
          H160,
          unknown,
          unknown,
          EvmLog[]
        ];

        return [
          TransactionReceipt.create({
            id: `${block.block.header.number.toString()}-${event.extrinsic?.idx ?? NOT_EXIST_TRANSACTION_INDEX}`,
            to: evmAddress.toString(),
            from: '', // @Todo
            contractAddress: evmAddress.toString(),
            transactionIndex: event.phase.toNumber(),
            gasUsed: 0, // @Todo
            logsBloom: '0x', // @Todo
            blockHash: block.block.hash,
            transactionHash: event.extrinsic.extrinsic.hash.toHex(),
            blockNumber: block.block.header.number.toNumber(),
            confirmations: 4, // @Todo
            cumulativeGasUsed: 0, // @Todo
            byzantium: false,
            status: 0,
          }),
          logs,
        ] as [TransactionReceipt, EvmLog[]];
      }
    }

    return null;
  };

  const ret = processEvent();
  if (!ret) {
    logger.debug(`Unsupported event: ${event.event.method}`);
    return;
  }

  const [transactionReceipt, logs] = ret;

  logs.forEach((evmLog, idx) => createLog(transactionReceipt.id, idx, evmLog));

  await transactionReceipt.save();
}
