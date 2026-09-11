import React, { useState, useMemo } from 'react';
import { CategoryBudget, Transaction, ExpenseCategory } from '../types/budget';
import { EXPENSE_CATEGORY_MAP } from '../utils/mockBudgetData';

// Inline SVG Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="w-4 h-4 text-zinc-550 hover:text-red-400 transition-colors"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="w-4 h-4 text-zinc-500 hover:text-zinc-200 transition-colors"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

interface BudgetOverviewProps {
  budgets: CategoryBudget[];
  setBudgets: (budgets: CategoryBudget[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
}

export function BudgetOverview({
  budgets,
  setBudgets,
  transactions,
  setTransactions,
}: BudgetOverviewProps) {
  // Modals / Forms State
  const [isTxFormOpen, setIsTxFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [editingBudgetCategory, setEditingBudgetCategory] = useState<ExpenseCategory | null>(null);

  // New Transaction Form State
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState<ExpenseCategory>('groceries');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit Budget Form State
  const [budgetLimitInput, setBudgetLimitInput] = useState('');

  // Calculations: actual spending aggregated per category
  const spendingByCategory = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      housing: 0,
      utilities: 0,
      groceries: 0,
      transportation: 0,
      entertainment: 0,
      insurance: 0,
      miscellaneous: 0,
    };

    transactions.forEach((tx) => {
      map[tx.category] += tx.amount;
    });

    return map;
  }, [transactions]);

  // Total Spending & Total Budget
  const totalBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.limit, 0);
  }, [budgets]);

  const totalSpending = useMemo(() => {
    return Object.values(spendingByCategory).reduce((sum, val) => sum + val, 0);
  }, [spendingByCategory]);

  // Format Helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Actions
  const handleOpenEditBudget = (item: CategoryBudget) => {
    setEditingBudgetCategory(item.category);
    setBudgetLimitInput(item.limit.toString());
    setIsBudgetFormOpen(true);
  };

  const handleSaveBudgetLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudgetCategory || !budgetLimitInput || isNaN(parseFloat(budgetLimitInput))) return;

    setBudgets(
      budgets.map((b) =>
        b.category === editingBudgetCategory ? { ...b, limit: parseFloat(budgetLimitInput) } : b,
      ),
    );
    setIsBudgetFormOpen(false);
    setEditingBudgetCategory(null);
    setBudgetLimitInput('');
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescription || !txAmount || isNaN(parseFloat(txAmount)) || !txDate) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: txDescription,
      amount: parseFloat(txAmount),
      category: txCategory,
      date: txDate,
    };

    setTransactions([newTx, ...transactions]);
    setIsTxFormOpen(false);
    setTxDescription('');
    setTxAmount('');
    setTxCategory('groceries');
    setTxDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="w-full max-w-5xl px-4 py-8 mx-auto text-zinc-100 min-h-screen">
      {/* Top Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Monthly Budgets</h2>
          <p className="text-sm text-zinc-400">
            Track and compare actual spending against your target budgets
          </p>
        </div>
        <button
          onClick={() => setIsTxFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 active:scale-95 text-white rounded-lg transition"
        >
          <PlusIcon />
          Add Transaction
        </button>
      </header>

      {/* Main Budget Progress and Comparison Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Total Spending Snapshot Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Monthly Spend
            </span>
            <div className="mt-2 text-4xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalSpending)}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Budget Target: {formatCurrency(totalBudget)}
            </div>

            {/* Total Budget Progress Bar */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-400">Total Budget Utilized</span>
                <span
                  className={
                    totalSpending > totalBudget ? 'text-rose-400 font-bold' : 'text-emerald-400'
                  }
                >
                  {totalBudget > 0 ? ((totalSpending / totalBudget) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    totalSpending > totalBudget ? 'bg-rose-500' : 'bg-indigo-500'
                  }`}
                  style={{
                    width: `${Math.min(100, totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Breakdown List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-400 mb-4">
              Budgets by Category
            </h3>
            <div className="flex flex-col gap-4">
              {budgets.map((b) => {
                const actual = spendingByCategory[b.category];
                const percentage = b.limit > 0 ? (actual / b.limit) * 100 : 0;
                const isOverBudget = actual > b.limit;
                const catConfig = EXPENSE_CATEGORY_MAP[b.category];

                return (
                  <div
                    key={b.category}
                    className="group p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-sm text-zinc-200">
                          {catConfig.label}
                        </span>
                        <div className="mt-1 text-[11px] text-zinc-400">
                          {formatCurrency(actual)} of {formatCurrency(b.limit)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isOverBudget ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md">
                            Over by {formatCurrency(actual - b.limit)}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                            Remaining {formatCurrency(b.limit - actual)}
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenEditBudget(b)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded transition"
                          title={`Edit ${catConfig.label} budget`}
                        >
                          <EditIcon />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOverBudget ? 'bg-rose-500' : catConfig.bgClass
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List and Registry */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-400 mb-4">
          Transactions
        </h3>
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            No transactions recorded this month.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map((tx) => {
              const catConfig = EXPENSE_CATEGORY_MAP[tx.category];
              return (
                <div
                  key={tx.id}
                  className="group flex justify-between items-center p-4 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-zinc-700 transition"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-200">{tx.description}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      <span className={catConfig.colorClass}>{catConfig.label}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-white">
                      -{formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded transition"
                      title="Delete transaction"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Budget Modal */}
      {isBudgetFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-850 p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">
              Edit {editingBudgetCategory ? EXPENSE_CATEGORY_MAP[editingBudgetCategory].label : ''}{' '}
              Budget
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Update the monthly spending limit for this category.
            </p>
            <form onSubmit={handleSaveBudgetLimit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Monthly Limit
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={budgetLimitInput}
                  onChange={(e) => setBudgetLimitInput(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsBudgetFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-white hover:bg-zinc-100 text-zinc-950 rounded-lg transition"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isTxFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-850 p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Add Transaction</h3>
            <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="e.g. Weekly Groceries"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Category
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                  >
                    {Object.entries(EXPENSE_CATEGORY_MAP).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="e.g. 45.50"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsTxFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-white hover:bg-zinc-100 text-zinc-950 rounded-lg transition"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default BudgetOverview;
