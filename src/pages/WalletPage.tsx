import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ConnectKitButton } from 'connectkit';
import { useAccount, useBalance } from 'wagmi';
import { WalletService } from '../services/WalletService';
import { DemoBanner } from '../components/ui/DemoBanner';
import { Button } from '../components/ui/Button';
import type { Page } from '../App';

interface Props { onNavigate: (p: Page) => void; }

export function WalletPage({ onNavigate }: Props) {
  const [wallet, setWallet] = useState(WalletService.getState());
  const [copiedAddr, setCopiedAddr] = useState(false);
  const { address: onchainAddr, isConnected } = useAccount();
  const { data: onchainBalance } = useBalance({ address: onchainAddr, chainId: 5042002 });

  useEffect(() => WalletService.subscribe(setWallet), []);

  const displayAddress = onchainAddr ?? '0x4f3C8e9A2bD1F6c7E5a0B4d3C2F1E8A7B6D5C4E3';

  const copyAddr = async () => {
    try { await navigator.clipboard.writeText(displayAddress); } catch { /* ignore */ }
    setCopiedAddr(true);
    toast.success('Address copied');
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const CARD = 'rounded-2xl border border-[color:var(--border)] p-5';
  const SURFACE = { background: 'var(--surface-muted)' };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <DemoBanner />

      {/* Wallet connection card */}
      <div className={CARD} style={SURFACE}>
        <h2 className="display font-bold text-base mb-4" style={{color:'var(--ink)'}}>Wallet</h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{color:'var(--muted)',letterSpacing:'0.07em'}}>Connected Wallet</p>
            {isConnected && onchainAddr ? (
              <>
                <p className="mono text-sm font-semibold" style={{color:'var(--ink)'}}>{onchainAddr.slice(0,8)}...{onchainAddr.slice(-6)}</p>
                <p className="text-xs mt-0.5" style={{color:'var(--buy)'}}>Connected to Arc Testnet</p>
              </>
            ) : (
              <p className="text-sm" style={{color:'var(--subtle)'}}>Not connected — using demo wallet</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>{void copyAddr();}} className="p-2 rounded-xl hover:bg-[color:var(--surface-hover)] transition-colors" style={{color:copiedAddr?'var(--success)':'var(--muted)'}}>
              {copiedAddr ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
            <ConnectKitButton />
          </div>
        </div>

        {/* Address + network */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)]">
            <p style={{color:'var(--muted)'}}>Network</p>
            <p className="font-semibold mt-0.5" style={{color:'var(--ink)'}}>{wallet.network}</p>
          </div>
          <div className="p-3 rounded-xl bg-[color:var(--surface)] border border-[color:var(--border)]">
            <p style={{color:'var(--muted)'}}>Chain ID</p>
            <p className="font-semibold mono mt-0.5" style={{color:'var(--ink)'}}>{wallet.chainId}</p>
          </div>
        </div>

        {/* On-chain balance if connected */}
        {isConnected && onchainBalance && (
          <div className="mt-3 p-3 rounded-xl bg-[color:var(--success-dim)] border border-[color:rgba(52,200,123,0.2)] text-xs">
            <p style={{color:'var(--success)'}}>Live Arc Testnet Balance</p>
            <p className="font-bold tabular-nums mt-0.5" style={{color:'var(--ink)'}}>{parseFloat(onchainBalance.formatted).toFixed(6)} {onchainBalance.symbol}</p>
          </div>
        )}
      </div>

      {/* Balance overview */}
      <div className={CARD} style={SURFACE}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="display font-bold text-sm" style={{color:'var(--ink)'}}>Balances</h3>
          <button onClick={()=>WalletService.connect()} className="flex items-center gap-1.5 text-xs" style={{color:'var(--accent)'}}>
            <RefreshCw className="size-3" /> Refresh
          </button>
        </div>

        <div className="space-y-1">
          {/* Header */}
          <div className="flex items-center gap-3 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{color:'var(--subtle)',letterSpacing:'0.07em'}}>
            <span className="flex-1">Asset</span>
            <span className="w-24 text-right">Available</span>
            <span className="w-20 text-right">Locked</span>
            <span className="w-24 text-right">Total</span>
            <span className="w-24 text-right">USD Value</span>
            <span className="w-16 text-right">24h</span>
          </div>

          {wallet.assets.map(a=>(
            <div key={a.symbol} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[color:var(--surface-hover)] transition-colors">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{background:a.logoColor}}>{a.symbol.slice(0,2)}</div>
                <div>
                  <div className="text-sm font-semibold" style={{color:'var(--ink)'}}>{a.symbol}</div>
                  <div className="text-xs" style={{color:'var(--muted)'}}>{a.name}</div>
                </div>
              </div>
              <span className="w-24 text-right text-xs tabular-nums font-medium" style={{color:'var(--ink-2)'}}>{(a.balance-a.locked).toLocaleString('en-US',{maximumFractionDigits:6})}</span>
              <span className="w-20 text-right text-xs tabular-nums" style={{color:'var(--warning)'}}>{a.locked>0?a.locked.toLocaleString('en-US',{maximumFractionDigits:6}):'-'}</span>
              <span className="w-24 text-right text-xs tabular-nums font-semibold" style={{color:'var(--ink)'}}>{a.balance.toLocaleString('en-US',{maximumFractionDigits:6})}</span>
              <span className="w-24 text-right text-xs tabular-nums font-semibold" style={{color:'var(--ink)'}}>${a.usdValue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
              <span className={`w-16 text-right text-xs tabular-nums font-medium ${a.change24h>=0?'text-[color:var(--buy)]':'text-[color:var(--sell)]'}`}>{a.change24h>=0?'+':''}{a.change24h.toFixed(2)}%</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-[color:var(--border)] flex items-center justify-between">
          <span className="text-sm font-semibold" style={{color:'var(--muted)'}}>Total Portfolio Value</span>
          <span className="display text-xl font-bold tabular-nums" style={{color:'var(--ink)'}}>
            ${wallet.totalUsdValue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className={CARD} style={SURFACE}>
        <h3 className="display font-bold text-sm mb-3" style={{color:'var(--ink)'}}>Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" fullWidth onClick={()=>onNavigate('send')}>Send Assets</Button>
          <Button variant="secondary" fullWidth onClick={()=>onNavigate('receive')}>Receive Assets</Button>
          <Button variant="secondary" fullWidth onClick={()=>onNavigate('swap')}>Swap Tokens</Button>
          <Button variant="secondary" fullWidth onClick={()=>onNavigate('spot')}>Spot Trade</Button>
        </div>
      </div>
    </div>
  );
}
