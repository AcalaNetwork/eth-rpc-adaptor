import type { EvmLog, H160 } from '@polkadot/types/interfaces/types';
import { SubstrateEvent } from '@subql/types';
import { Log, TransactionReceipt } from '../types';

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  if (event.event.section.toUpperCase() !== 'EVM') return;

  const { block } = event;

  if (event.event.method.toUpperCase() === 'LOG') {
    const evmLog = event.event.data[0] as EvmLog;

    const log = Log.create({
      id: event.idx,
      transactionHash: event.extrinsic.extrinsic.hash.toHex(),
      blockNumber: block.block.header.number.toNumber(),
      blockHash: block.block.hash,
      transactionIndex: event.phase.toNumber(),
      removed: false,
      address: evmLog.address.toString().toLowerCase(),
      data: evmLog.address.toString().toLowerCase(),
      topics: evmLog.topics.toJSON(),
      logIndex: event.idx,
    });

    await log.save();
  }

  // EvmAddress
  if (['Created', 'Executed'].includes(event.event.method.toUpperCase())) {
    const evmAddress = event.event.data[0] as H160;

    const transactionReceipt = TransactionReceipt.create({
      id: event.idx,
      to: evmAddress.toString(),
      from: '', // @Todo
      contractAddress: evmAddress.toString(),
      transactionIndex: event.phase.toNumber(),
      gasUsed: 0, // @Todo
      logsBloom: '0x', // @Todo
      blockHash: block.block.hash,
      transactionHash: event.extrinsic.extrinsic.hash.toHex(),
      logs: [event.idx],
      blockNumber: block.block.header.number.toNumber(),
      confirmations: 4, // @Todo
      cumulativeGasUsed: 0, // @Todo
      byzantium: false,
      status: 1,
    });

    await transactionReceipt.save();
  }

  // EvmAddress, ExitReason, Bytes
  if (['CreatedFailed', 'ExecutedFailed'].includes(event.event.method.toUpperCase())) {
    const evmAddress = event.event.data[0] as H160;

    const transactionReceipt = TransactionReceipt.create({
      id: event.idx,
      to: evmAddress.toString(),
      from: '', // @Todo
      contractAddress: evmAddress.toString(),
      transactionIndex: event.phase.toNumber(),
      gasUsed: 0, // @Todo
      logsBloom: '0x', // @Todo
      blockHash: block.block.hash,
      transactionHash: event.extrinsic.extrinsic.hash.toHex(),
      logs: [event.idx],
      blockNumber: block.block.header.number.toNumber(),
      confirmations: 4, // @Todo
      cumulativeGasUsed: 0, // @Todo
      byzantium: false,
      status: 0,
    });

    await transactionReceipt.save();
  }
}
