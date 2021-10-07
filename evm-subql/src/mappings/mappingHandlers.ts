import type { EvmLog, H160 } from '@polkadot/types/interfaces/types';
import { SubstrateEvent } from '@subql/types';
import { Log, TransactionReceipt } from '../types';

const NOT_EXIST_TRANSACTION_INDEX = 0xffffffff

export async function handleEvmEvent(event: SubstrateEvent): Promise<void> {
  const { block } = event;

  switch (event.event.method) {
    case 'Log': {
      const evmLog = event.event.data[0] as EvmLog;

      const log = Log.create({
        id: `${block.block.header.number.toString()}-${event.extrinsic?.idx ?? NOT_EXIST_TRANSACTION_INDEX}`,
        transactionHash: event.extrinsic.extrinsic.hash.toHex(),
        blockNumber: block.block.header.number.toNumber(),
        blockHash: block.block.hash,
        transactionIndex: event.phase.toNumber(),
        removed: false,
        address: evmLog.address.toString().toLowerCase(),
        data: evmLog.address.toString().toLowerCase(),
        topics: evmLog.topics.toJSON(),
        logIndex: event.idx,
        receiptId: 
      });
  
      await log.save();
    }
    case 'Created':
    case 'Executed': {
      // EvmAddress
      const evmAddress = event.event.data[0] as H160;
  
      const transactionReceipt = TransactionReceipt.create({
        id: `${block.block.header.number.toString()}-${event.extrinsic?.idx ?? NOT_EXIST_TRANSACTION_INDEX}`,
        to: evmAddress.toString(),
        from: '', // @Todo
        contractAddress: evmAddress.toString(),
        transactionIndex: event.phase.isApplyExtrinsic ? event.extrinsic?.idx ?? NOT_EXIST_TRANSACTION_INDEX,
        gasUsed: 0, // @Todo
        logsBloom: '0x', // @Todo
        blockHash: block.block.hash,
        transactionHash: event.extrinsic.extrinsic.hash.toHex(),
        blockNumber: block.block.header.number.toNumber(),
        confirmations: 4, // @Todo
        cumulativeGasUsed: 0, // @Todo
        byzantium: false,
        status: 1,
      });

      await transactionReceipt.save();
    }
    case 'CreatedFailed':
    case 'ExecutedFailed': {
      // EvmAddress, ExitReason, Bytes
      const evmAddress = event.event.data[0] as H160;

      const transactionReceipt = TransactionReceipt.create({
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
      });
  
      await transactionReceipt.save();
    }
  }
}
