import { useState } from 'react';
import { Shield, AlertTriangle, ExternalLink, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DemoBanner } from '../components/ui/DemoBanner';

interface Props { darkMode: boolean; onToggleDark: () => void; }

export function SettingsPage({ darkMode, onToggleDark }: Props) {
  const [defaultSlippage, setDefaultSlippage] = useState('0.5');
  const [notifications, setNotifications] = useState({ fills: true, liquidations: true, transfers: true });
  const [confirmHigh, setConfirmHigh] = useState(true);

  const CARD = 'rounded-2xl border border-[color:var(--border)] p-5';
  const SURFACE = { background: 'var(--surface-muted)' };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <DemoBanner />

      {/* Appearance */}
      <div className={CARD} style={SURFACE}>
        <h3 className="display font-bold text-sm mb-4" style={{color:'var(--ink)'}}>Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{color:'var(--ink)'}}>Color Mode</p>
            <p className="text-xs mt-0.5" style={{color:'var(--muted)'}}>Switch between dark and light interface</p>
          </div>
          <button onClick={onToggleDark} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[color:var(--border)] hover:bg-[color:var(--surface-hover)] transition-colors text-sm font-semibold" style={{color:'var(--ink-2)'}}>
            {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Trading */}
      <div className={CARD} style={SURFACE}>
        <h3 className="display font-bold text-sm mb-4" style={{color:'var(--ink)'}}>Trading Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:'var(--muted)',letterSpacing:'0.07em'}}>Default Slippage Tolerance</label>
            <div className="flex gap-2 items-center">
              {['0.1','0.5','1.0'].map(v=>(
                <button key={v} onClick={()=>setDefaultSlippage(v)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${defaultSlippage===v?'bg-[color:var(--accent-dim)] text-[color:var(--accent)]':'bg-[color:var(--surface)] text-[color:var(--muted)] hover:text-[color:var(--ink-2)]'}`}>{v}%</button>
              ))}
              <input type="number" placeholder="Custom" value={!['0.1','0.5','1.0'].includes(defaultSlippage)?defaultSlippage:''} onChange={e=>setDefaultSlippage(e.target.value)}
                className="flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-sm py-1.5 px-2 text-[color:var(--ink)] placeholder:text-[color:var(--subtle)] outline-none" />
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium" style={{color:'var(--ink)'}}>Confirm high-impact trades</p>
              <p className="text-xs mt-0.5" style={{color:'var(--muted)'}}>Show extra confirmation for trades with &gt;1% price impact</p>
            </div>
            <div className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${confirmHigh?'bg-[color:var(--accent)]':'bg-[color:var(--surface)]'}`} onClick={()=>setConfirmHigh(!confirmHigh)}>
              <div className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform shadow ${confirmHigh?'translate-x-5':'translate-x-0.5'}`} />
            </div>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className={CARD} style={SURFACE}>
        <h3 className="display font-bold text-sm mb-4" style={{color:'var(--ink)'}}>Notifications</h3>
        <div className="space-y-3">
          {[
            {k:'fills',      l:'Order Fills',       d:'When your orders are executed'},
            {k:'liquidations',l:'Liquidation Alerts', d:'When your margin is dangerously low'},
            {k:'transfers', l:'Transfer Complete',  d:'When sends and receives are confirmed'},
          ].map(({k,l,d})=>(
            <label key={k} className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium" style={{color:'var(--ink)'}}>{l}</p>
                <p className="text-xs mt-0.5" style={{color:'var(--muted)'}}>{d}</p>
              </div>
              <div className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${notifications[k as keyof typeof notifications]?'bg-[color:var(--accent)]':'bg-[color:var(--surface)]'}`}
                onClick={()=>setNotifications(n=>({...n,[k]:!n[k as keyof typeof n]}))}>
                <div className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform shadow ${notifications[k as keyof typeof notifications]?'translate-x-5':'translate-x-0.5'}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className={CARD} style={SURFACE}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-4 text-[color:var(--accent)]" />
          <h3 className="display font-bold text-sm" style={{color:'var(--ink)'}}>Security & Compliance</h3>
        </div>
        <div className="space-y-3 text-sm">
          {[
            'Always verify recipient wallet addresses before sending funds.',
            'ArcFusion will NEVER ask for your private key or seed phrase.',
            'Blockchain transactions are generally irreversible once confirmed.',
            'Transaction fees are displayed before any trade or transfer is confirmed.',
            'Futures trading carries significant risk including total loss of margin.',
            'All demo/testnet transactions are clearly labeled. No real funds are used.',
          ].map((t,i)=>(
            <div key={i} className="flex items-start gap-2">
              <div className="size-1.5 rounded-full mt-1.5 shrink-0" style={{background:'var(--accent)'}} />
              <p style={{color:'var(--ink-2)'}}>{t}</p>
            </div>
          ))}
        </div>

        {/* Risk disclosure */}
        <div className="mt-4 p-3 rounded-xl text-xs flex items-start gap-2" style={{background:'var(--danger-dim)',border:'1px solid rgba(240,86,106,0.15)',color:'var(--danger)'}}>
          <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
          <div>
            <strong>Risk Disclaimer:</strong> Crypto trading involves substantial risk. You may lose your entire investment. ArcFusion is a demo platform. Always do your own research and consult a financial advisor before trading with real funds.
          </div>
        </div>

        <a href="https://arc.io" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-[color:var(--accent)] hover:underline">
          Learn about Arc Blockchain <ExternalLink className="size-3" />
        </a>
      </div>

      <Button variant="secondary" fullWidth>Reset to Defaults</Button>
    </div>
  );
}
