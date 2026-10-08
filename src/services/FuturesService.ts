// ─── FuturesService ────────────────────────────────────────────────────────
// DEMO MODE — simulates perpetual futures positions and P&L.
// Production: replace with on-chain perpetuals protocol on Arc.

import { nanoid } from 'nanoid';
import type { FuturesPosition, FuturesOrder, PositionSide, OrderType } from './types';
import { MarketDataService } from './MarketDataService';
import { WalletService } from './WalletService';
import { TransactionService } from './TransactionService';

const positions: FuturesPosition[] = [];
const closedHistory: FuturesPosition[] = [];
const orders: FuturesOrder[] = [];

// Seed one open position
(function seed() {
  const entryPrice = 66_200;
  const markPrice = MarketDataService.getPrice('BTC/USDC') || 67_420;
  const size = 0.1;
  const leverage = 10;
  const margin = (entryPrice * size) / leverage;
  const pnl = (markPrice - entryPrice) * size;
  positions.push({
    id: nanoid(8),
    symbol: 'BTC/USDC-PERP',
    side: 'long',
    leverage,
    size,
    notional: markPrice * size,
    entryPrice,
    markPrice,
    liquidationPrice: entryPrice * (1 - 1 / leverage * 0.9),
    unrealizedPnl: pnl,
    unrealizedPnlPct: (pnl / margin) * 100,
    realizedPnl: 0,
    margin,
    maintenanceMargin: margin * 0.05,
    openedAt: new Date(Date.now() - 7.2e6),
  });
})();

type PositionListener = (positions: FuturesPosition[]) => void;
const posListeners = new Set<PositionListener>();
function notify() { posListeners.forEach((fn) => fn([...positions])); }

// Tick mark prices
setInterval(() => {
  positions.forEach((pos) => {
    const markPrice = MarketDataService.getPrice(pos.symbol);
    if (!markPrice) return;
    pos.markPrice = markPrice;
    pos.notional = markPrice * pos.size;
    const pnl = pos.side === 'long'
      ? (markPrice - pos.entryPrice) * pos.size
      : (pos.entryPrice - markPrice) * pos.size;
    pos.unrealizedPnl = pnl;
    pos.unrealizedPnlPct = (pnl / pos.margin) * 100;
  });
  notify();
}, 1500);

export const FuturesService = {
  getPositions(): FuturesPosition[] { return [...positions]; },
  getHistory(): FuturesPosition[] { return [...closedHistory]; },
  getOrders(): FuturesOrder[] { return [...orders]; },

  subscribe(fn: PositionListener): () => void {
    posListeners.add(fn);
    return () => posListeners.delete(fn);
  },

  async openPosition(params: {
    symbol: string;
    side: PositionSide;
    type: OrderType;
    leverage: number;
    margin: number;   // USDC to put up
    price?: number;
  }): Promise<FuturesPosition> {
    await delay(800 + Math.random() * 400);

    const available = WalletService.getAvailable('USDC');
    if (available < params.margin) throw new Error('Insufficient USDC margin');

    const entryPrice = params.type === 'market'
      ? MarketDataService.getPrice(params.symbol)
      : (params.price ?? MarketDataService.getPrice(params.symbol));
    if (!entryPrice) throw new Error('Price unavailable');

    const notional = params.margin * params.leverage;
    const size     = notional / entryPrice;
    const liqDist  = 1 / params.leverage * 0.9;
    const liquidationPrice = params.side === 'long'
      ? entryPrice * (1 - liqDist)
      : entryPrice * (1 + liqDist);

    const pos: FuturesPosition = {
      id: nanoid(8),
      symbol: params.symbol,
      side: params.side,
      leverage: params.leverage,
      size: +size.toFixed(6),
      notional,
      entryPrice,
      markPrice: entryPrice,
      liquidationPrice: +liquidationPrice.toFixed(2),
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      realizedPnl: 0,
      margin: params.margin,
      maintenanceMargin: +(params.margin * 0.05).toFixed(2),
      openedAt: new Date(),
    };

    WalletService.lock('USDC', params.margin);
    positions.push(pos);
    notify();
    return pos;
  },

  async closePosition(id: string, closePrice?: number): Promise<void> {
    await delay(600);
    const idx = positions.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Position not found');
    const pos = positions[idx];
    const exitPrice = closePrice ?? MarketDataService.getPrice(pos.symbol) ?? pos.markPrice;
    const pnl = pos.side === 'long'
      ? (exitPrice - pos.entryPrice) * pos.size
      : (pos.entryPrice - exitPrice) * pos.size;
    pos.realizedPnl = pnl;
    pos.unrealizedPnl = 0;
    WalletService.unlock('USDC', pos.margin);
    const payout = pos.margin + pnl;
    if (payout > 0) WalletService.credit('USDC', payout, 1);
    closedHistory.unshift({ ...pos, markPrice: exitPrice });
    positions.splice(idx, 1);
    TransactionService.add({
      type: 'futures',
      asset: pos.symbol.split('/')[0],
      amount: pos.size,
      usdValue: Math.abs(pnl),
      fee: +(pos.notional * 0.0004).toFixed(4),
      from: `${pos.side.toUpperCase()} ${pos.symbol}`,
      to: 'Closed',
      status: 'completed',
      note: `Realized P&L: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDC`,
    });
    notify();
  },
};

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
