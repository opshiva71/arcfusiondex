import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { RefreshCw, X } from 'lucide-react';
import { MarketDataService } from '../services/MarketDataService';
import { TradingService } from '../services/TradingService';
import { WalletService } from '../services/WalletService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PriceDisplay } from '../components/ui/PriceDisplay';
import { SideBadge, OrderStatusBadge } from '../components/ui/Badge';
import { DemoBanner } from '../components/ui/DemoBanner';
import type { TradingPair, OrderBookLevel, RecentTrade, SpotOrder, Side, OrderType } from '../services/types';

const PAIRS = ['ARC/USDC', 'BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'BNB/USDC', 'ARB/USDC', 'LINK/USDC'];
const CARD = 'rounded-2xl border border-[color:var(--border)]';
const SURFACE = { background: 'var(--surface-muted)' };

function OrderBook({ symbol }: { symbol: string }) {
  const [book, setBook] = useState(MarketDataService.getOrderBook(symbol));
  useEffect(() => {
    const t = setInterval(() => setBook(MarketDataService.getOrderBook(symbol)), 1500);
    return () => clearInterval(t);
  }, [symbol]);

  const maxTotal = Math.max(...book.asks.map(a => a.total), ...book.bids.map(b => b.total));
  const Row = ({ level, side }: { level: OrderBookLevel; side: Side }) => {
    const pct = (level.total / maxTotal) * 100;
    return (
      <div className="relative flex items-center gap-2 px-2 py-0.5 text-xs tabular-nums hover:bg-[color:var(--surface-hover)] rounded cursor-default overflow-hidden">
        <div className={`absolute inset-y-0 ${side === 'buy' ? 'right-0' : 'right-0'} opacity-15 rounded`}
          style={{ width: `${pct}%`, background: side === 'buy' ? 'var(--buy)' : 'var(--sell)' }} />
        <span className={`flex-1 ${side === 'buy' ? 'text-[color:var(--buy)]' : 'text-[color:var(--sell)]'}`}>{level.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
        <span className="text-[color:var(--ink-2)]">{level.size.toFixed(4)}</span>
        <span className="text-[color:var(--muted)] w-14 text-right">{level.total.toFixed(4)}</span>
      </div>
    );
  };
  const mid = MarketDataService.getPrice(symbol);
  return (
    <div>
      <div className="flex gap-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
        <span className="flex-1">Price</span><span>Size</span><span className="w-14 text-right">Total</span>
      </div>
      {book.asks.slice().reverse().slice(0, 8).map((a, i) => <Row key={i} level={a} side="sell" />)}
      <div className="my-1 py-1 px-2 flex items-center gap-2 border-y border-[color:var(--border)]">
        <PriceDisplay price={mid} size="md" />
        <span className="text-xs" style={{ color: 'var(--muted)' }}>Mid</span>
      </div>
      {book.bids.slice(0, 8).map((b, i) => <Row key={i} level={b} side="buy" />)}
    </div>
  );
}

function RecentTrades({ symbol }: { symbol: string }) {
  const [trades, setTrades] = useState<RecentTrade[]>(MarketDataService.getRecentTrades(symbol));
  useEffect(() => {
    const t = setInterval(() => setTrades(MarketDataService.getRecentTrades(symbol)), 1800);
    return () => clearInterval(t);
  }, [symbol]);
  return (
    <div className="space-y-0.5">
      <div className="flex gap-2 pb-1 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
        <span className="flex-1">Price</span><span>Size</span><span className="w-16 text-right">Time</span>
      </div>
      {trades.slice(0, 16).map((t) => (
        <div key={t.id} className="flex items-center gap-2 px-2 py-0.5 text-xs tabular-nums hover:bg-[color:var(--surface-hover)] rounded">
          <span className={`flex-1 ${t.side === 'buy' ? 'text-[color:var(--buy)]' : 'text-[color:var(--sell)]'}`}>
            {t.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </span>
          <span style={{ color: 'var(--ink-2)' }}>{t.size.toFixed(4)}</span>
          <span className="w-16 text-right" style={{ color: 'var(--muted)' }}>{t.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
        </div>
      ))}
    </div>
  );
}

function CandleChart({ symbol }: { symbol: string }) {
  const candles = MarketDataService.getCandles(symbol);
  const last20 = candles.slice(-60);
  const prices = last20.flatMap(c => [c.high, c.low]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 520, H = 160;
  const bw = W / last20.length - 1;

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
        {last20.map((c, i) => {
          const x = i * (W / last20.length) + bw / 2;
          const openY  = H - ((c.open  - min) / range) * H;
          const closeY = H - ((c.close - min) / range) * H;
          const highY  = H - ((c.high  - min) / range) * H;
          const lowY   = H - ((c.low   - min) / range) * H;
          const isGreen = c.close >= c.open;
          const color = isGreen ? 'var(--buy)' : 'var(--sell)';
          const top = Math.min(openY, closeY);
          const bodyH = Math.max(Math.abs(closeY - openY), 1);
          return (
            <g key={i}>
              <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1" opacity="0.6" />
              <rect x={x - bw / 2} y={top} width={bw} height={bodyH} fill={color} rx="0.5" />
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-between px-1 mt-1 text-xs tabular-nums" style={{ color: 'var(--subtle)' }}>
        <span>${min.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
        <span>${max.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}

export function SpotPage() {
  const [symbol, setSymbol] = useState('BTC/USDC');
  const [pair, setPair] = useState<TradingPair | undefined>(MarketDataService.getPair(symbol));
  const [orders, setOrders] = useState<SpotOrder[]>(TradingService.getOrders());
  const [side, setSide] = useState<Side>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');

  useEffect(() => {
    return MarketDataService.subscribe((pairs) => {
      setPair(pairs.find(p => p.symbol === symbol));
    });
  }, [symbol]);
  useEffect(() => TradingService.subscribe(setOrders), []);

  const [base, quote] = symbol.split('/');
  const midPrice = pair?.price ?? 0;
  const total = (parseFloat(price || String(midPrice)) || 0) * (parseFloat(amount) || 0);
  const fee = total * 0.001;
  const available = side === 'buy' ? WalletService.getAvailable(quote) : WalletService.getAvailable(base);

  const validate = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) return 'Enter amount';
    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) return 'Enter price';
    return null;
  }, [amount, price, orderType]);

  const submit = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      await TradingService.submitOrder({
        symbol, side, type: orderType,
        price: orderType === 'limit' ? parseFloat(price) : undefined,
        amount: parseFloat(amount),
      });
      toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order placed`);
      setAmount(''); setPrice('');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Order failed');
    } finally { setLoading(false); }
  };

  const openOrders = orders.filter(o => o.status === 'open' || o.status === 'partial');
  const histOrders = orders.filter(o => o.status === 'filled' || o.status === 'cancelled');

  return (
    <div className="max-w-full space-y-3">
      <DemoBanner />

      {/* Pair selector + price bar */}
      <div className={`${CARD} p-3`} style={SURFACE}>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-sm font-semibold px-3 py-2 text-[color:var(--ink)] outline-none"
          >
            {PAIRS.map(p => <option key={p}>{p}</option>)}
          </select>
          {pair && (
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="display text-xl font-bold"><PriceDisplay price={pair.price} change={pair.change24h} showIcon /></span>
              {[
                { l: '24h High', v: `$${pair.high24h.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
                { l: '24h Low',  v: `$${pair.low24h.toLocaleString('en-US',  { maximumFractionDigits: 2 })}` },
                { l: '24h Vol',  v: `${(pair.volume24h / 1e6).toFixed(2)}M` },
              ].map(({l, v}) => (
                <div key={l} className="hidden sm:block">
                  <div style={{ color: 'var(--subtle)' }}>{l}</div>
                  <div className="font-semibold tabular-nums" style={{ color: 'var(--ink-2)' }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main trading layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px_280px] gap-3">
        {/* Chart + orders */}
        <div className="space-y-3">
          <div className={`${CARD} p-4`} style={SURFACE}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Candlestick · 15m · Demo data</span>
            </div>
            <CandleChart symbol={symbol} />
          </div>

          {/* Orders table */}
          <div className={`${CARD} p-4`} style={SURFACE}>
            <div className="flex gap-3 mb-3 border-b border-[color:var(--border)]">
              {(['open', 'history'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-[color:var(--accent)] text-[color:var(--accent)]' : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--ink-2)]'}`}>
                  {tab === 'open' ? `Open Orders (${openOrders.length})` : 'History'}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>{['Pair','Side','Type','Price','Amount','Filled','Status',''].map(h => <th key={h} className="text-left pb-2 pr-3 font-semibold uppercase tracking-wider whitespace-nowrap" style={{color:'var(--subtle)',letterSpacing:'0.07em'}}>{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border)]">
                  {(activeTab === 'open' ? openOrders : histOrders).map(o => (
                    <tr key={o.id} className="hover:bg-[color:var(--surface-hover)] transition-colors">
                      <td className="py-2.5 pr-3 font-semibold" style={{color:'var(--ink)'}}>{o.symbol}</td>
                      <td className="py-2.5 pr-3"><SideBadge side={o.side} /></td>
                      <td className="py-2.5 pr-3 capitalize" style={{color:'var(--ink-2)'}}>{o.type}</td>
                      <td className="py-2.5 pr-3 tabular-nums" style={{color:'var(--ink-2)'}}>{o.price.toLocaleString('en-US',{maximumFractionDigits:4})}</td>
                      <td className="py-2.5 pr-3 tabular-nums" style={{color:'var(--ink-2)'}}>{o.amount.toFixed(4)}</td>
                      <td className="py-2.5 pr-3 tabular-nums" style={{color:'var(--ink-2)'}}>{o.filled.toFixed(4)}</td>
                      <td className="py-2.5 pr-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="py-2.5">
                        {(o.status === 'open' || o.status === 'partial') && (
                          <button onClick={() => TradingService.cancelOrder(o.id)} className="p-1 rounded hover:bg-[color:var(--danger-dim)] text-[color:var(--danger)] transition-colors">
                            <X className="size-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(activeTab === 'open' ? openOrders : histOrders).length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-xs" style={{color:'var(--subtle)'}}>No orders</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Book */}
        <div className={`${CARD} p-3`} style={SURFACE}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{color:'var(--muted)',letterSpacing:'0.07em'}}>Order Book</span>
            <RefreshCw className="size-3" style={{color:'var(--subtle)'}} />
          </div>
          <OrderBook symbol={symbol} />
          <div className="mt-3 border-t border-[color:var(--border)] pt-3">
            <span className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{color:'var(--muted)',letterSpacing:'0.07em'}}>Recent Trades</span>
            <RecentTrades symbol={symbol} />
          </div>
        </div>

        {/* Buy / Sell panel */}
        <div className={`${CARD} p-4`} style={SURFACE}>
          {/* Side tabs */}
          <div className="grid grid-cols-2 gap-1 mb-4 p-1 rounded-xl bg-[color:var(--surface)]">
            <button onClick={() => setSide('buy')} className={`rounded-lg py-2 text-sm font-bold transition-all ${side === 'buy' ? 'bg-[color:var(--buy)] text-[#0a1628]' : 'text-[color:var(--muted)] hover:text-[color:var(--buy)]'}`}>Buy</button>
            <button onClick={() => setSide('sell')} className={`rounded-lg py-2 text-sm font-bold transition-all ${side === 'sell' ? 'bg-[color:var(--sell)] text-white' : 'text-[color:var(--muted)] hover:text-[color:var(--sell)]'}`}>Sell</button>
          </div>

          {/* Order type */}
          <div className="grid grid-cols-2 gap-1 mb-4">
            {(['limit', 'market'] as const).map(t => (
              <button key={t} onClick={() => setOrderType(t)}
                className={`rounded-xl py-1.5 text-xs font-semibold capitalize transition-colors ${orderType === t ? 'bg-[color:var(--accent-dim)] text-[color:var(--accent)]' : 'text-[color:var(--muted)] hover:text-[color:var(--ink-2)]'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Available */}
            <div className="flex items-center justify-between text-xs">
              <span style={{color:'var(--muted)'}}>Available</span>
              <span className="tabular-nums font-semibold" style={{color:'var(--ink-2)'}}>
                {available.toLocaleString('en-US', { maximumFractionDigits: 6 })} {side === 'buy' ? quote : base}
              </span>
            </div>

            {/* Price */}
            {orderType === 'limit' ? (
              <Input label="Price (USDC)" type="number" placeholder={midPrice.toFixed(2)} value={price} onChange={e => setPrice(e.target.value)} />
            ) : (
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2.5">
                <div className="text-xs font-semibold mb-0.5 uppercase tracking-wider" style={{color:'var(--muted)',letterSpacing:'0.07em'}}>Price</div>
                <div className="text-sm font-semibold" style={{color:'var(--accent)'}}>Market Price ~${midPrice.toLocaleString('en-US',{maximumFractionDigits:2})}</div>
              </div>
            )}

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{color:'var(--muted)',letterSpacing:'0.07em'}}>Amount ({base})</label>
                <button onClick={() => {
                  if (side === 'buy') {
                    const p = parseFloat(price || String(midPrice)) || midPrice;
                    setAmount(p > 0 ? (available / p * 0.99).toFixed(6) : '');
                  } else {
                    setAmount(available.toFixed(6));
                  }
                }} className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-[color:var(--accent-dim)] text-[color:var(--accent)]">MAX</button>
              </div>
              <input type="number" placeholder="0.0000" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--border)] focus:border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] text-sm py-2.5 px-3 outline-none text-[color:var(--ink)] placeholder:text-[color:var(--subtle)]" />
            </div>

            {/* Summary */}
            {amount && (
              <div className="rounded-xl bg-[color:var(--surface)] p-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span style={{color:'var(--muted)'}}>Total</span><span className="tabular-nums font-semibold" style={{color:'var(--ink-2)'}}>${total.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>
                <div className="flex justify-between"><span style={{color:'var(--muted)'}}>Fee (0.1%)</span><span className="tabular-nums" style={{color:'var(--ink-2)'}}>${fee.toFixed(4)}</span></div>
              </div>
            )}

            <Button
              variant={side === 'buy' ? 'buy' : 'sell'}
              fullWidth
              size="lg"
              loading={loading}
              disabled={!!validate() || loading}
              onClick={() => setConfirmOpen(true)}
            >
              {validate() ?? `${side === 'buy' ? 'Buy' : 'Sell'} ${base}`}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Order">
        <div className="space-y-3">
          <div className="rounded-xl bg-[color:var(--surface)] p-4 space-y-2 text-sm">
            {[
              { l: 'Pair',   v: symbol },
              { l: 'Side',   v: <SideBadge side={side} /> },
              { l: 'Type',   v: <span className="capitalize">{orderType}</span> },
              { l: 'Price',  v: orderType === 'market' ? 'Market' : `$${parseFloat(price).toLocaleString('en-US',{maximumFractionDigits:4})}` },
              { l: 'Amount', v: `${amount} ${base}` },
              { l: 'Total',  v: `$${total.toFixed(2)}` },
              { l: 'Fee',    v: `$${fee.toFixed(4)}` },
            ].map(({l, v}) => (
              <div key={l} className="flex items-center justify-between">
                <span style={{color:'var(--muted)'}}>{l}</span>
                <span className="font-semibold" style={{color:'var(--ink)'}}>{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{color:'var(--subtle)'}}>This is a demo order. No real funds will be moved on the blockchain.</p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant={side === 'buy' ? 'buy' : 'sell'} fullWidth loading={loading} onClick={() => { void submit(); }}>Confirm {side === 'buy' ? 'Buy' : 'Sell'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
