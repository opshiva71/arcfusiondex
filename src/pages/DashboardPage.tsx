import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, ArrowLeftRight, Send,
  Download, Zap, ArrowUpRight, BarChart2, Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketDataService } from '../services/MarketDataService';
import { WalletService } from '../services/WalletService';
import { TransactionService } from '../services/TransactionService';
import { PriceDisplay, PnlDisplay } from '../components/ui/PriceDisplay';
import { Button } from '../components/ui/Button';
import { TxStatusBadge } from '../components/ui/Badge';
import { DemoBanner } from '../components/ui/DemoBanner';
import { MiniChart, seedSparkline } from '../components/ui/MiniChart';
import type { TradingPair } from '../services/types';
import type { Page } from '../App';

interface Props { onNavigate: (p: Page) => void; }

const CARD = 'rounded-2xl p-4 border border-[color:var(--border)]';
const SURFACE = { background: 'var(--surface-muted)' };

export function DashboardPage({ onNavigate }: Props) {
  const [pairs, setPairs] = useState<TradingPair[]>(MarketDataService.getPairs());
  const [wallet, setWallet] = useState(WalletService.getState());
  const txs = TransactionService.getRecent(5);

  useEffect(() => MarketDataService.subscribe(setPairs), []);
  useEffect(() => WalletService.subscribe(setWallet), []);

  const totalPnl = wallet.assets.reduce((s, a) => s + (a.change24h / 100) * a.usdValue, 0);
  const totalPnlPct = wallet.totalUsdValue > 0 ? (totalPnl / wallet.totalUsdValue) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <DemoBanner />

      {/* Portfolio summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Portfolio', value: `$${wallet.totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: <PnlDisplay value={totalPnl} pct={totalPnlPct} size="sm" />, icon: <BarChart2 className="size-4" /> },
          { label: 'Available Balance', value: `$${wallet.assets.find(a=>a.symbol==='USDC')?.balance.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) ?? '0.00'}`, sub: <span className="text-xs" style={{color:'var(--muted)'}}>USDC</span>, icon: <Zap className="size-4" /> },
          { label: 'Available Margin', value: `$${wallet.availableMargin.toLocaleString()}`, sub: <span className="text-xs" style={{color:'var(--muted)'}}>Futures margin</span>, icon: <Activity className="size-4" /> },
          { label: 'Open Positions', value: '1', sub: <span className="text-xs text-[color:var(--buy)]">+$122.00 unrealized</span>, icon: <TrendingUp className="size-4" /> },
        ].map((stat) => (
          <motion.div key={stat.label} className={CARD} style={SURFACE} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)', letterSpacing: '0.07em' }}>{stat.label}</span>
              <div className="p-1.5 rounded-lg bg-[color:var(--accent-dim)] text-[color:var(--accent)]">{stat.icon}</div>
            </div>
            <div className="display text-xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>{stat.value}</div>
            <div className="mt-1">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {([
          { label: 'Spot Trade', page: 'spot', icon: TrendingUp },
          { label: 'Futures', page: 'futures', icon: Activity },
          { label: 'Swap', page: 'swap', icon: ArrowLeftRight },
          { label: 'Send', page: 'send', icon: Send },
          { label: 'Receive', page: 'receive', icon: Download },
        ] as const).map(({ label, page, icon: Icon }) => (
          <Button key={label} variant="secondary" size="sm" onClick={() => onNavigate(page)}>
            <Icon className="size-3.5" />{label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Market overview */}
        <div className={`lg:col-span-2 ${CARD}`} style={SURFACE}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="display font-bold text-sm" style={{ color: 'var(--ink)' }}>Market Overview</h2>
            <Button variant="ghost" size="xs" onClick={() => onNavigate('spot')}>View all <ArrowUpRight className="size-3" /></Button>
          </div>
          <div className="space-y-1">
            {pairs.slice(0, 6).map((pair) => {
              const spark = seedSparkline(pair.symbol);
              const isPos = pair.change24h >= 0;
              return (
                <button
                  key={pair.symbol}
                  onClick={() => onNavigate('spot')}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[color:var(--surface-hover)] transition-colors group"
                >
                  <div className="w-24 text-left">
                    <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{pair.base}</span>
                    <span className="text-xs ml-1" style={{ color: 'var(--subtle)' }}>/{pair.quote}</span>
                  </div>
                  <div className="flex-1 hidden sm:block">
                    <MiniChart data={spark} positive={isPos} />
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-semibold tabular-nums display" style={{ color: 'var(--ink)' }}>
                      <PriceDisplay price={pair.price} />
                    </div>
                    <div className={`text-xs tabular-nums font-medium ${isPos ? 'text-[color:var(--buy)]' : 'text-[color:var(--sell)]'}`}>
                      {isPos ? '+' : ''}{pair.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div className={`shrink-0 flex items-center ${isPos ? 'text-[color:var(--buy)]' : 'text-[color:var(--sell)]'}`}>
                    {isPos ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Holdings */}
        <div className={CARD} style={SURFACE}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="display font-bold text-sm" style={{ color: 'var(--ink)' }}>Holdings</h2>
            <Button variant="ghost" size="xs" onClick={() => onNavigate('wallet')}>View <ArrowUpRight className="size-3" /></Button>
          </div>
          <div className="space-y-2">
            {wallet.assets.map((asset) => {
              const alloc = wallet.totalUsdValue > 0 ? (asset.usdValue / wallet.totalUsdValue) * 100 : 0;
              return (
                <div key={asset.symbol} className="flex items-center gap-2.5">
                  <div className="size-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: asset.logoColor }}>{asset.symbol.slice(0, 2)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{asset.symbol}</span>
                      <span className="text-sm tabular-nums font-semibold" style={{ color: 'var(--ink)' }}>${asset.usdValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full overflow-hidden bg-[color:var(--surface)]">
                      <div className="h-full rounded-full" style={{ width: `${alloc}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className={CARD} style={SURFACE}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="display font-bold text-sm" style={{ color: 'var(--ink)' }}>Recent Activity</h2>
          <Button variant="ghost" size="xs" onClick={() => onNavigate('transactions')}>All transactions <ArrowUpRight className="size-3" /></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                {['Type', 'Asset', 'Amount', 'USD Value', 'Status', 'Time'].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 font-semibold uppercase tracking-wider" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {txs.map((tx) => (
                <tr key={tx.id} className="hover:bg-[color:var(--surface-hover)] transition-colors">
                  <td className="py-2.5 pr-4 capitalize font-medium" style={{ color: 'var(--ink-2)' }}>{tx.type}</td>
                  <td className="py-2.5 pr-4 font-semibold" style={{ color: 'var(--ink)' }}>{tx.asset}</td>
                  <td className="py-2.5 pr-4 tabular-nums" style={{ color: 'var(--ink-2)' }}>{tx.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}</td>
                  <td className="py-2.5 pr-4 tabular-nums" style={{ color: 'var(--ink-2)' }}>${tx.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-2.5 pr-4"><TxStatusBadge status={tx.status} /></td>
                  <td className="py-2.5 tabular-nums" style={{ color: 'var(--muted)' }}>{new Date(tx.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
