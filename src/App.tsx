import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SpotPage } from './pages/SpotPage';
import { FuturesPage } from './pages/FuturesPage';
import { SwapPage } from './pages/SwapPage';
import { SendPage } from './pages/SendPage';
import { ReceivePage } from './pages/ReceivePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { OrdersPage } from './pages/OrdersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { WalletPage } from './pages/WalletPage';
import { SettingsPage } from './pages/SettingsPage';

export type Page =
  | 'dashboard' | 'spot' | 'futures' | 'swap'
  | 'send' | 'receive' | 'portfolio' | 'orders'
  | 'transactions' | 'wallet' | 'settings';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [darkMode, setDarkMode] = useState(true);

  // Apply dark/light mode to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  }, [darkMode]);

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppLayout current={page} onNavigate={navigate} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {page === 'dashboard'    && <DashboardPage    onNavigate={navigate} />}
          {page === 'spot'         && <SpotPage />}
          {page === 'futures'      && <FuturesPage />}
          {page === 'swap'         && <SwapPage />}
          {page === 'send'         && <SendPage />}
          {page === 'receive'      && <ReceivePage />}
          {page === 'portfolio'    && <PortfolioPage    onNavigate={navigate} />}
          {page === 'orders'       && <OrdersPage />}
          {page === 'transactions' && <TransactionsPage />}
          {page === 'wallet'       && <WalletPage       onNavigate={navigate} />}
          {page === 'settings'     && <SettingsPage     darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
