// ─── WalletService ─────────────────────────────────────────────────────────
// DEMO MODE — manages mock wallet state. Production: replace with wagmi
// useAccount / useBalance / useReadContract on Arc Testnet.

import type { Asset, WalletState } from './types';

const DEMO_ADDRESS = '0x4f3C...8aB2'; // display only — never a real key

const INITIAL_ASSETS: Asset[] = [
  { symbol: 'USDC',  name: 'USD Coin',       balance: 12_450.00, locked: 1_200.00, usdValue: 12_450.00, price: 1.000,    change24h:  0.01,  logoColor: '#2775CA' },
  { symbol: 'ARC',   name: 'Arc',            balance: 8_340.00,  locked:   500.00, usdValue: 28_521.48, price: 3.42,     change24h:  4.23,  logoColor: '#ACC6E9' },
  { symbol: 'BTC',   name: 'Bitcoin',        balance:  0.3812,   locked:     0,    usdValue: 25_717.68, price: 67_420,   change24h:  1.87,  logoColor: '#F7931A' },
  { symbol: 'ETH',   name: 'Ethereum',       balance:  2.5500,   locked:  0.25,    usdValue:  8_978.55, price:  3_521,   change24h: -0.54,  logoColor: '#627EEA' },
  { symbol: 'SOL',   name: 'Solana',         balance: 14.800,    locked:     0,    usdValue:  2_699.52, price:  182.4,   change24h:  6.12,  logoColor: '#9945FF' },
  { symbol: 'ARB',   name: 'Arbitrum',       balance: 420.00,    locked:     0,    usdValue:   495.60,  price:    1.18,  change24h: -1.33,  logoColor: '#12AAFF' },
];

let state: WalletState = {
  address: DEMO_ADDRESS,
  isConnected: false,
  network: 'Arc Testnet',
  chainId: 5042002,
  totalUsdValue: 0,
  assets: INITIAL_ASSETS,
  availableMargin: 3_200,
  usedMargin: 800,
};

function recalcTotal() {
  state.totalUsdValue = state.assets.reduce((s, a) => s + a.usdValue, 0);
}
recalcTotal();

type StateListener = (s: WalletState) => void;
const listeners = new Set<StateListener>();
function notify() { recalcTotal(); listeners.forEach((fn) => fn({ ...state })); }

export const WalletService = {
  getState(): WalletState { recalcTotal(); return { ...state }; },

  connect(): WalletState {
    state.isConnected = true;
    notify();
    return { ...state };
  },

  disconnect(): void {
    state.isConnected = false;
    notify();
  },

  subscribe(fn: StateListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Deduct asset balance (demo trade fill) */
  deduct(symbol: string, amount: number): void {
    const asset = state.assets.find((a) => a.symbol === symbol);
    if (asset) {
      asset.balance = Math.max(0, asset.balance - amount);
      asset.usdValue = asset.balance * asset.price;
    }
    notify();
  },

  /** Credit asset balance (demo trade fill) */
  credit(symbol: string, amount: number, price: number): void {
    let asset = state.assets.find((a) => a.symbol === symbol);
    if (!asset) {
      asset = { symbol, name: symbol, balance: 0, locked: 0, usdValue: 0, price, change24h: 0, logoColor: '#ACC6E9' };
      state.assets.push(asset);
    }
    asset.balance += amount;
    asset.price = price;
    asset.usdValue = asset.balance * price;
    notify();
  },

  /** Lock balance for open orders */
  lock(symbol: string, amount: number): void {
    const asset = state.assets.find((a) => a.symbol === symbol);
    if (asset) { asset.locked += amount; }
    notify();
  },

  unlock(symbol: string, amount: number): void {
    const asset = state.assets.find((a) => a.symbol === symbol);
    if (asset) { asset.locked = Math.max(0, asset.locked - amount); }
    notify();
  },

  getBalance(symbol: string): number {
    return state.assets.find((a) => a.symbol === symbol)?.balance ?? 0;
  },

  getAvailable(symbol: string): number {
    const a = state.assets.find((x) => x.symbol === symbol);
    return a ? a.balance - a.locked : 0;
  },
};
