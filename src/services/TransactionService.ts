// ─── TransactionService ────────────────────────────────────────────────────
// Central ledger for all demo transactions (trades, swaps, sends, receives).

import { nanoid } from 'nanoid';
import type { Transfer, TxStatus } from './types';

const EXPLORER = 'https://explorer.testnet.arc.io/tx/';

// Seed history
const txs: Transfer[] = [
  {
    id: nanoid(8), hash: '0xabc1...def2', type: 'trade',   asset: 'BTC',  amount: 0.05,    usdValue:  3_341,  fee: 3.34,  from: 'ArcFusion Market', to: 'Your Wallet', status: 'completed', timestamp: new Date(Date.now() - 3.6e6),  explorerUrl: `${EXPLORER}0xabc1def2` },
  { id: nanoid(8), hash: '0xbcd2...ef03', type: 'send',    asset: 'USDC', amount: 500,      usdValue:    500,  fee: 0.50,  from: '0x4f3C...8aB2', to: '0x9e1A...3cD4', status: 'completed', timestamp: new Date(Date.now() - 7.2e6),  explorerUrl: `${EXPLORER}0xbcd2ef03` },
  { id: nanoid(8), hash: '0xcd03...f014', type: 'receive', asset: 'ARC',  amount: 1_000,    usdValue:  3_420,  fee: 0,     from: '0xAa45...1Bc6', to: '0x4f3C...8aB2', status: 'completed', timestamp: new Date(Date.now() - 8.64e6), explorerUrl: `${EXPLORER}0xcd03f014` },
  { id: nanoid(8), hash: '0xde14...0125', type: 'swap',    asset: 'ETH',  amount: 0.5,      usdValue:  1_760,  fee: 1.76,  from: 'ETH', to: 'USDC',  status: 'completed', timestamp: new Date(Date.now() - 1.08e7), explorerUrl: `${EXPLORER}0xde140125` },
  { id: nanoid(8), hash: '0xef25...1236', type: 'futures', asset: 'BTC',  amount: 0.1,      usdValue:  6_742,  fee: 6.74,  from: 'Long BTC-PERP', to: 'Closed', status: 'completed', timestamp: new Date(Date.now() - 1.44e7), explorerUrl: `${EXPLORER}0xef251236` },
];

type TxListener = (txs: Transfer[]) => void;
const listeners = new Set<TxListener>();
function notify() { listeners.forEach((fn) => fn([...txs])); }

export const TransactionService = {
  getAll(): Transfer[] { return [...txs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); },
  getRecent(n = 10): Transfer[] { return this.getAll().slice(0, n); },

  subscribe(fn: TxListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  add(params: Omit<Transfer, 'id' | 'hash' | 'timestamp' | 'explorerUrl' | 'status'> & { status?: TxStatus }): Transfer {
    const tx: Transfer = {
      id: nanoid(8),
      hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      timestamp: new Date(),
      explorerUrl: `${EXPLORER}${Math.random().toString(16).slice(2, 10)}`,
      status: 'completed',
      ...params,
    };
    txs.unshift(tx);
    notify();
    return tx;
  },
};
