import { AlertTriangle } from 'lucide-react';

export function DemoBanner() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
      style={{ background: 'var(--warning-dim)', color: 'var(--warning)', border: '1px solid rgba(245,166,35,0.18)' }}
    >
      <AlertTriangle className="size-3.5 shrink-0" />
      <span>
        <strong>Demo Mode</strong> — All data is simulated. No real blockchain transactions are executed.
        Connect Arc Testnet to enable live trading.
      </span>
    </div>
  );
}

export function RiskWarning({ text }: { text: string }) {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
      style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid rgba(240,86,106,0.18)' }}
    >
      <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
