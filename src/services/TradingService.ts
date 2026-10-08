// ─── TradingService ────────────────────────────────────────────────────────
// DEMO MODE — simulates spot order matching. Production: replace submitOrder
// with a smart-contract call or CEX API request on Arc.

import { nanoid } from 'nanoid';
import type { SpotOrder, Side, OrderType } from './types';
import { MarketDataService } from './MarketDataService';
import { WalletService } from './WalletService';
import { TransactionService } from './TransactionService';

const orders: SpotOrder[] = [];

// Pre-fill some history
function seedOrders() {
  const now = Date.now();
  const seeds: Partial<SpotOrder>[] = [
    { symbol: 'BTC/USDC', side: 'buy',  type: 'limit',  price: 66_800, amount: 0.05, filled: 0.05, status: 'filled',    createdAt: new Date(now - 3.6e6) },
    { symbol: 'ETH/USDC', side: 'sell', type: 'market', price: 3_510,  amount: 0.5,  filled: 0.5,  status: 'filled',    createdAt: new Date(now - 7.2e6) },
    { symbol: 'ARC/USDC', side: 'buy',  type: 'limit',  price: 3.30,   amount: 500,  filled: 500,  status: 'filled',    createdAt: new Date(now - 1.44e7) },
    { symbol: 'SOL/USDC', side: 'buy',  type: 'limit',  price: 175,    amount: 5,    filled: 3,    status: 'partial',   createdAt: new Date(now - 1800000) },
  ];
  seeds.forEach((s) => {
    const remaining = (s.amount ?? 0) - (s.filled ?? 0);
    orders.push({
      id: nanoid(8),
      symbol: s.symbol ?? 'ARC/USDC',
      side: s.side as Side,
      type: s.type as OrderType,
      price: s.price ?? 0,
      amount: s.amount ?? 0,
      filled: s.filled ?? 0,
      remaining,
      status: s.status as SpotOrder['status'],
      createdAt: s.createdAt ?? new Date(),
      updatedAt: s.createdAt ?? new Date(),
      fee: +(((s.filled ?? 0) * (s.price ?? 0) * 0.001)).toFixed(4),
      feeAsset: 'USDC',
      total: +((s.amount ?? 0) * (s.price ?? 0)).toFixed(4),
    });
  });
}
seedOrders();

type OrderListener = (orders: SpotOrder[]) => void;
const listeners = new Set<OrderListener>();
function notify() { listeners.forEach((fn) => fn([...orders])); }

export const TradingService = {
  getOrders(): SpotOrder[] { return [...orders]; },
  getOpenOrders(): SpotOrder[] { return orders.filter((o) => o.status === 'open' || o.status === 'partial'); },
  getOrderHistory(): SpotOrder[] { return orders.filter((o) => o.status === 'filled' || o.status === 'cancelled'); },

  subscribe(fn: OrderListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  async submitOrder(params: {
    symbol: string;
    side: Side;
    type: OrderType;
    price?: number;
    amount: number;
  }): Promise<SpotOrder> {
    await delay(600 + Math.random() * 400);

    const [base, quote] = params.symbol.split('/');
    const fillPrice = params.type === 'market'
      ? MarketDataService.getPrice(params.symbol)
      : (params.price ?? MarketDataService.getPrice(params.symbol));

    if (!fillPrice || fillPrice <= 0) throw new Error('Unable to get market price');

    const total = params.amount * fillPrice;
    const fee   = +(total * 0.001).toFixed(6);

    // Validate balance
    if (params.side === 'buy') {
      const available = WalletService.getAvailable(quote);
      if (available < total + fee) throw new Error(`Insufficient ${quote} balance`);
    } else {
      const available = WalletService.getAvailable(base);
      if (available < params.amount) throw new Error(`Insufficient ${base} balance`);
    }

    // For market orders: immediate fill
    const isFilled = params.type === 'market' || Math.random() > 0.3;
    const order: SpotOrder = {
      id: nanoid(8),
      symbol: params.symbol,
      side: params.side,
      type: params.type,
      price: fillPrice,
      amount: params.amount,
      filled: isFilled ? params.amount : 0,
      remaining: isFilled ? 0 : params.amount,
      status: isFilled ? 'filled' : 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      fee,
      feeAsset: quote,
      total: +total.toFixed(6),
    };

    orders.unshift(order);

    // Update wallet
    if (isFilled) {
      if (params.side === 'buy') {
        WalletService.deduct(quote, total + fee);
        WalletService.credit(base, params.amount, fillPrice);
      } else {
        WalletService.deduct(base, params.amount);
        WalletService.credit(quote, total - fee, 1);
      }
      TransactionService.add({
        type: 'trade',
        asset: base,
        amount: params.amount,
        usdValue: total,
        fee,
        from: 'ArcFusion Market',
        to: params.side === 'buy' ? 'Your Wallet' : 'ArcFusion Market',
        status: 'completed',
        note: `${params.side.toUpperCase()} ${params.amount} ${base} @ ${fillPrice}`,
      });
    }

    notify();
    return order;
  },

  cancelOrder(id: string): void {
    const order = orders.find((o) => o.id === id);
    if (order && (order.status === 'open' || order.status === 'partial')) {
      order.status = 'cancelled';
      order.updatedAt = new Date();
      WalletService.unlock(order.symbol.split('/')[1], order.remaining * order.price);
    }
    notify();
  },
};

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
