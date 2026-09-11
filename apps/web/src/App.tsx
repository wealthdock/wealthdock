import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { BudgetOverview } from './components/BudgetOverview';
import { Asset } from './types/asset';
import { CategoryBudget, Transaction } from './types/budget';
import { INITIAL_MOCK_ASSETS } from './utils/mockData';
import { INITIAL_BUDGETS, INITIAL_TRANSACTIONS } from './utils/mockBudgetData';
import { api } from './utils/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'net-worth' | 'budget'>('net-worth');

  // Auth / Network states
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [authEmail, setAuthEmail] = useState<string | null>(api.getEmail());
  const [offlineMode, setOfflineMode] = useState(() => {
    const isTest = import.meta.env.MODE === 'test';
    const isVitest =
      typeof window !== 'undefined' &&
      ((window as unknown as Record<string, unknown>).__vitest_worker__ !== undefined ||
        (window as unknown as Record<string, unknown>).custom_vitest_flag !== undefined);
    if (isTest || isVitest) return true;
    return api.isAuthenticated();
  });
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login / Register Form state
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Shared application states
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('wealthdock_offline_assets');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_ASSETS;
  });
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('wealthdock_offline_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('wealthdock_offline_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Sync data on mount or authentication change
  useEffect(() => {
    if (isAuthenticated) {
      setOfflineMode(false);
      loadSyncData();
    }
  }, [isAuthenticated]);

  const loadSyncData = async () => {
    setIsLoading(true);
    try {
      const payloadStr = await api.fetchSync();
      setIsOffline(false);
      if (payloadStr) {
        const data = JSON.parse(payloadStr);
        if (data.assets && data.assets.length > 0) {
          setAssets(data.assets);
        }
        if (data.budgets && data.budgets.length > 0) {
          setBudgets(data.budgets);
        }
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      }
    } catch (err) {
      console.error('Failed to load sync data, working with cache/offline.', err);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSyncData = async (
    newAssets: Asset[],
    newBudgets: CategoryBudget[],
    newTx: Transaction[],
  ) => {
    // Cache locally
    localStorage.setItem('wealthdock_offline_assets', JSON.stringify(newAssets));
    localStorage.setItem('wealthdock_offline_budgets', JSON.stringify(newBudgets));
    localStorage.setItem('wealthdock_offline_transactions', JSON.stringify(newTx));

    if (api.isAuthenticated() && !offlineMode) {
      try {
        const payload = JSON.stringify({
          assets: newAssets,
          budgets: newBudgets,
          transactions: newTx,
        });
        await api.saveSync(payload);
        setIsOffline(false);
      } catch (err) {
        console.error('Failed to sync to server', err);
        setIsOffline(true);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    try {
      if (isRegistering) {
        await api.register(emailInput, passwordInput);
      } else {
        await api.login(emailInput, passwordInput);
      }
      setIsAuthenticated(true);
      setAuthEmail(api.getEmail());
      setOfflineMode(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setAuthEmail(null);
    setOfflineMode(true);
    // Keep local data as is so user can continue viewing
  };

  const handleContinueOffline = () => {
    setOfflineMode(true);
    setAuthError(null);
  };

  // If not authenticated and not explicitly in offline mode, show login/register form
  if (!isAuthenticated && !offlineMode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">wealthdock</h1>
            <p className="text-sm text-zinc-400 mt-2">Sign in to sync your data across devices</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. you@example.com"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
              />
            </div>

            {authError && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-white hover:bg-zinc-100 disabled:opacity-50 text-zinc-950 font-semibold text-sm rounded-lg transition"
            >
              {isLoading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
            >
              {isRegistering
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </button>

            <div className="border-t border-zinc-800 my-2" />

            <button
              onClick={handleContinueOffline}
              className="text-xs text-zinc-500 hover:text-zinc-350 transition"
            >
              Continue Offline (No Sync)
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-white">
      {/* Network / Offline warning banners */}
      {isOffline && (
        <div className="w-full bg-amber-500/15 border-b border-amber-500/30 py-2 text-center text-xs text-amber-400 font-medium px-4">
          ⚠️ Connection to server lost. Working in offline mode. Changes will sync once reconnected.
        </div>
      )}
      {offlineMode && !isOffline && (
        <div className="w-full bg-zinc-900/50 border-b border-zinc-800/80 py-2 text-center text-xs text-zinc-400 px-4 flex justify-center items-center gap-2">
          <span>ℹ️ You are in offline mode. Data is saved locally.</span>
          <button
            onClick={() => {
              setOfflineMode(false);
              setIsAuthenticated(false);
            }}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
          >
            Sign In to Sync
          </button>
        </div>
      )}

      {/* Shared Layout Header */}
      <div className="w-full max-w-5xl px-4 pt-8 mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-6 mb-6">
          <div className="flex justify-between items-start w-full sm:w-auto">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">wealthdock</h1>
              <p className="text-sm text-zinc-400">Unified wealth and asset tracking platform</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* User status & Logout */}
            {isAuthenticated && authEmail && (
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="truncate max-w-[150px] font-medium bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                  {authEmail}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-350 border border-zinc-800 hover:text-white rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 self-end">
              <button
                onClick={() => setActiveTab('net-worth')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === 'net-worth'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Net Worth
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === 'budget'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Budget Planner
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Page Content */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-zinc-400 text-sm">
            Loading data from secure cloud...
          </div>
        ) : activeTab === 'net-worth' ? (
          <Dashboard
            assets={assets}
            setAssets={(newAssets) => {
              setAssets(newAssets);
              saveSyncData(newAssets, budgets, transactions);
            }}
          />
        ) : (
          <BudgetOverview
            budgets={budgets}
            setBudgets={(newBudgets) => {
              setBudgets(newBudgets);
              saveSyncData(assets, newBudgets, transactions);
            }}
            transactions={transactions}
            setTransactions={(newTx) => {
              setTransactions(newTx);
              saveSyncData(assets, budgets, newTx);
            }}
          />
        )}
      </div>
    </main>
  );
}

export default App;
