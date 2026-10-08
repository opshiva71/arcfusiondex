import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, RefreshCw } from 'lucide-react';
import { ConnectKitButton } from 'connectkit';
import type { Page } from '../../App';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard', spot: 'Spot Trading', futures: 'Futures',
  swap: 'Token Swap', send: 'Send', receive: 'Receive',
  portfolio: 'Portfolio', orders: 'Orders', transactions: 'Transactions',
  wallet: 'Wallet', settings: 'Settings',
};

interface TopBarProps {
  current: Page;
  onMenuOpen: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export function TopBar({ current, onMenuOpen, darkMode, onToggleDark }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 py-2.5 border-b border-[color:var(--border)]"
      style={{ background: 'var(--surface-muted)', backdropFilter: 'blur(12px)' }}
    >
      <button
        onClick={onMenuOpen}
        className="lg:hidden p-2 rounded-lg hover:bg-[color:var(--surface-hover)] transition-colors"
        style={{ color: 'var(--muted)' }}
      >
        <Menu className="size-5" />
      </button>

      <h1 className="display font-bold text-base" style={{ color: 'var(--ink)' }}>
        {PAGE_TITLES[current]}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Clock */}
        <span className="mono hidden sm:block text-xs tabular-nums" style={{ color: 'var(--subtle)' }}>
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>

        {/* Refresh hint */}
        <button
          className="p-2 rounded-lg hover:bg-[color:var(--surface-hover)] transition-colors"
          style={{ color: 'var(--subtle)' }}
          title="Market data refreshes automatically"
        >
          <RefreshCw className="size-4" />
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-[color:var(--surface-hover)] transition-colors relative"
          style={{ color: 'var(--subtle)' }}
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[color:var(--danger)]" />
        </button>

        {/* Dark / light toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg hover:bg-[color:var(--surface-hover)] transition-colors"
          style={{ color: 'var(--subtle)' }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        {/* Wallet connect */}
        <ConnectKitButton />
      </div>
    </header>
  );
}
