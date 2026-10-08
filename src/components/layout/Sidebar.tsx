import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Activity, ArrowLeftRight,
  Send, Download, PieChart, ClipboardList, History,
  Wallet, Settings, X, Zap, ChevronRight,
} from 'lucide-react';
import type { Page } from '../../App';

interface NavItem {
  id: Page;
  label: string;
  icon: React.FC<{ className?: string }>;
  group?: string;
}

const NAV: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, group: 'Main' },
  { id: 'spot',         label: 'Spot',         icon: TrendingUp,      group: 'Trade' },
  { id: 'futures',      label: 'Futures',      icon: Activity,        group: 'Trade' },
  { id: 'swap',         label: 'Swap',         icon: ArrowLeftRight,  group: 'Move' },
  { id: 'send',         label: 'Send',         icon: Send,            group: 'Move' },
  { id: 'receive',      label: 'Receive',      icon: Download,        group: 'Move' },
  { id: 'portfolio',    label: 'Portfolio',    icon: PieChart,        group: 'Manage' },
  { id: 'orders',       label: 'Orders',       icon: ClipboardList,   group: 'Manage' },
  { id: 'transactions', label: 'Transactions', icon: History,         group: 'Manage' },
  { id: 'wallet',       label: 'Wallet',       icon: Wallet,          group: 'Manage' },
  { id: 'settings',     label: 'Settings',     icon: Settings,        group: 'System' },
];

interface SidebarProps {
  current: Page;
  onNavigate: (p: Page) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavLink({ item, current, onClick }: { item: NavItem; current: Page; onClick: () => void }) {
  const active = current === item.id;
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? 'bg-[color:var(--accent-dim)] text-[color:var(--accent)]'
          : 'text-[color:var(--muted)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--ink-2)]'
      }`}
    >
      <Icon className={`size-4 shrink-0 ${active ? 'text-[color:var(--accent)]' : ''}`} />
      <span className="flex-1 text-left">{item.label}</span>
      {active && <ChevronRight className="size-3 opacity-60" />}
    </button>
  );
}

function SidebarContent({ current, onNavigate, onClose }: { current: Page; onNavigate: (p: Page) => void; onClose?: () => void }) {
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-[color:var(--accent-dim)]">
          <Zap className="size-4 text-[color:var(--accent)]" />
        </div>
        <span className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>ArcFusion</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-[color:var(--surface-hover)]" style={{ color: 'var(--muted)' }}>
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>{group}</p>
            {NAV.filter((n) => n.group === group).map((item) => (
              <NavLink key={item.id} item={item} current={current} onClick={() => { onNavigate(item.id); onClose?.(); }} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[color:var(--border)]">
        <div className="demo-badge w-fit">Demo Mode</div>
        <p className="mt-1 text-[10px]" style={{ color: 'var(--subtle)' }}>Arc Testnet · No real funds</p>
      </div>
    </div>
  );
}

export function Sidebar({ current, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden lg:flex w-56 shrink-0 flex-col border-r border-[color:var(--border)] h-screen sticky top-0"
        style={{ background: 'var(--surface-muted)' }}
      >
        <SidebarContent current={current} onNavigate={onNavigate} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
            <motion.aside
              className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r border-[color:var(--border)]"
              style={{ background: 'var(--surface-muted)' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            >
              <SidebarContent current={current} onNavigate={onNavigate} onClose={onMobileClose} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
