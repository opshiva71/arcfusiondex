// ─── ArcFusion Shared Types ────────────────────────────────────────────────
// DEMO MODE: all trading data is simulated. No real blockchain transactions
// are executed unless explicitly connected to Arc mainnet.

export type Side = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'open' | 'filled' | 'cancelled' | 'partial';
export type TxStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PositionSide = 'long' | 'short';

// ── Market ─────────────────────────────────────────────────────────────────

export interface TradingPair {
  symbol: string;     // e.g. 'ARC/USDC'
  base: string;       // e.g. 'ARC'
  quote: string;      // e.g. 'USDC'
  price: number;
  change24h: number;  // percent
  high24h: number;
  low24h: number;
  volume24h: number;
  isFutures?: boolean;
}

export interface Candle {
  time: number;   // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  size: number;
  side: Side;
  timestamp: Date;
}

// ── Orders ─────────────────────────────────────────────────────────────────

export interface SpotOrder {
  id: string;
  symbol: string;
  side: Side;
  type: OrderType;
  price: number;
  amount: number;
  filled: number;
  remaining: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  fee: number;
  feeAsset: string;
  total: number;
}

// ── Futures ────────────────────────────────────────────────────────────────

export interface FuturesPosition {
  id: string;
  symbol: string;
  side: PositionSide;
  leverage: number;
  size: number;         // base asset quantity
  notional: number;     // USD value
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  realizedPnl: number;
  margin: number;
  maintenanceMargin: number;
  openedAt: Date;
}

export interface FuturesOrder extends SpotOrder {
  leverage: number;
  positionSide: PositionSide;
}

// ── Wallet / Assets ────────────────────────────────────────────────────────

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  locked: number;
  usdValue: number;
  price: number;
  change24h: number;
  logoColor: string;  // tailwind bg class approximation
}

export interface WalletState {
  address: string;
  isConnected: boolean;
  network: string;
  chainId: number;
  totalUsdValue: number;
  assets: Asset[];
  availableMargin: number;   // for futures
  usedMargin: number;
}

// ── Swap ───────────────────────────────────────────────────────────────────

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  priceImpact: number;  // percent
  networkFee: number;
  slippage: number;
  minReceived: number;
  route: string[];
  estimatedTime: string;
}

// ── Transfer ───────────────────────────────────────────────────────────────

export interface Transfer {
  id: string;
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'trade' | 'futures';
  asset: string;
  amount: number;
  usdValue: number;
  fee: number;
  from: string;
  to: string;
  status: TxStatus;
  timestamp: Date;
  note?: string;
  explorerUrl?: string;
}

// ── Portfolio ──────────────────────────────────────────────────────────────

export interface PortfolioSnapshot {
  totalValue: number;
  availableBalance: number;
  lockedBalance: number;
  todayPnl: number;
  todayPnlPct: number;
  totalPnl: number;
  totalPnlPct: number;
  spotValue: number;
  futuresMargin: number;
  allocationPct: Record<string, number>;
}
