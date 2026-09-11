import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Asset, AssetType } from '../types/asset';
import { HistoryChart } from './HistoryChart';
import { api } from '../utils/api';

// Custom inline SVG icons
const BankIcon = () => (
  <svg
    className="w-5 h-5 text-indigo-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const CashIcon = () => (
  <svg
    className="w-5 h-5 text-emerald-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const HomeIcon = () => (
  <svg
    className="w-5 h-5 text-sky-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const CarIcon = () => (
  <svg
    className="w-5 h-5 text-amber-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7h12m0 0l-4-4H8m12 4v7m0 0H4M4 14v-7m0 0l4-4m0 4v7m0 0h16M8 21v-3m8 3v-3"
    />
  </svg>
);

const ChartIcon = () => (
  <svg
    className="w-5 h-5 text-violet-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 12l3-3 3 3 4-4M8 21h12a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="w-4 h-4 text-zinc-500 hover:text-red-455 transition-colors"
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

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const RefreshIcon = ({ spinning }: { spinning?: boolean }) => (
  <svg
    className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

// Map categories to labels, colors, and icons
const CATEGORY_MAP: Record<
  AssetType,
  { label: string; colorClass: string; bgClass: string; icon: React.ComponentType }
> = {
  bank: {
    label: 'Bank Accounts',
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500',
    icon: BankIcon,
  },
  cash: {
    label: 'Cash',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500',
    icon: CashIcon,
  },
  real_estate: {
    label: 'Real Estate',
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-500',
    icon: HomeIcon,
  },
  vehicle: {
    label: 'Vehicles',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500',
    icon: CarIcon,
  },
  investment: {
    label: 'Investments',
    colorClass: 'text-violet-400',
    bgClass: 'bg-violet-500',
    icon: ChartIcon,
  },
};

interface DashboardProps {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
}

export function Dashboard({ assets, setAssets }: DashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('bank');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [location, setLocation] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [symbol, setSymbol] = useState('');
  const [assetClass, setAssetClass] = useState<'stock' | 'crypto'>('stock');
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');

  const getEffectiveValue = useCallback(
    (asset: Asset): number => {
      if (asset.type === 'investment' && asset.details?.symbol && asset.details?.shares) {
        const livePrice = livePrices[asset.details.symbol];
        if (livePrice != null) return asset.details.shares * livePrice;
      }
      return asset.value;
    },
    [livePrices],
  );

  const fetchLivePrices = useCallback(async () => {
    const uniquePairs = Array.from(
      new Map(
        assets
          .filter((a) => a.type === 'investment' && a.details?.symbol)
          .map((a) => {
            const sym = a.details!.symbol!;
            const cls = a.details!.assetClass || 'stock';
            return [`${sym}:${cls}`, { symbol: sym, assetClass: cls }] as const;
          }),
      ).values(),
    );

    if (uniquePairs.length === 0) return;

    setIsRefreshingPrices(true);
    try {
      const results = await Promise.allSettled(
        uniquePairs.map((pair) => api.fetchQuote(pair.symbol, pair.assetClass)),
      );

      setLivePrices((prev) => {
        const next = { ...prev };
        results.forEach((result, i) => {
          const pair = uniquePairs[i];
          if (!pair) return;
          if (result.status === 'fulfilled') {
            next[pair.symbol] = result.value.price;
          }
          // On failure, leave the previous entry (if any) untouched so
          // getEffectiveValue keeps falling back to asset.value.
        });
        return next;
      });
    } finally {
      setIsRefreshingPrices(false);
    }
  }, [assets]);

  useEffect(() => {
    fetchLivePrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculations
  const totalNetWorth = useMemo(() => {
    return assets.reduce((sum, asset) => sum + getEffectiveValue(asset), 0);
  }, [assets, getEffectiveValue]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<AssetType, number> = {
      bank: 0,
      cash: 0,
      real_estate: 0,
      vehicle: 0,
      investment: 0,
    };

    assets.forEach((asset) => {
      breakdown[asset.type] += getEffectiveValue(asset);
    });

    return Object.entries(breakdown)
      .map(([key, val]) => {
        const percentage = totalNetWorth > 0 ? (val / totalNetWorth) * 100 : 0;
        return {
          type: key as AssetType,
          value: val,
          percentage,
          ...CATEGORY_MAP[key as AssetType],
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [assets, totalNetWorth, getEffectiveValue]);

  // Actions
  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setName(asset.name);
    setType(asset.type);
    setValue(asset.value.toString());
    setCurrency(asset.currency);

    // Prefill details
    setInstitution(asset.details?.institution || '');
    setAccountNumber(asset.details?.accountNumber || '');
    setLocation(asset.details?.location || '');
    setModelYear(asset.details?.modelYear?.toString() || '');
    setSymbol(asset.details?.symbol || '');
    setAssetClass(asset.details?.assetClass || 'stock');
    setShares(asset.details?.shares?.toString() || '');
    setPurchasePrice(asset.details?.purchasePrice?.toString() || '');
    setNotes(asset.details?.notes || '');

    setIsFormOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingAsset(null);
    resetFormState();
    setIsFormOpen(true);
  };

  const handleAddOrEditAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value || isNaN(parseFloat(value))) return;

    const details: NonNullable<Asset['details']> = {};
    if (type === 'bank') {
      if (institution) details.institution = institution;
      if (accountNumber) details.accountNumber = accountNumber;
    } else if (type === 'real_estate') {
      if (location) details.location = location;
      if (purchasePrice) details.purchasePrice = parseFloat(purchasePrice);
      if (notes) details.notes = notes;
    } else if (type === 'vehicle') {
      if (modelYear) details.modelYear = parseInt(modelYear);
      if (purchasePrice) details.purchasePrice = parseFloat(purchasePrice);
      if (notes) details.notes = notes;
    } else if (type === 'investment') {
      if (symbol) details.symbol = symbol;
      if (symbol) details.assetClass = assetClass;
      if (shares) details.shares = parseFloat(shares);
    }

    if (editingAsset) {
      // Edit operation
      setAssets(
        assets.map((a) =>
          a.id === editingAsset.id
            ? {
                ...a,
                name,
                type,
                value: parseFloat(value),
                currency,
                lastUpdated: new Date().toISOString(),
                details: Object.keys(details).length ? details : undefined,
              }
            : a,
        ),
      );
    } else {
      // Add operation
      const newAsset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        type,
        value: parseFloat(value),
        currency,
        lastUpdated: new Date().toISOString(),
        details: Object.keys(details).length ? details : undefined,
      };
      setAssets([...assets, newAsset]);
    }
    resetForm();
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  const resetFormState = () => {
    setName('');
    setType('bank');
    setValue('');
    setCurrency('USD');
    setInstitution('');
    setAccountNumber('');
    setLocation('');
    setModelYear('');
    setSymbol('');
    setAssetClass('stock');
    setShares('');
    setPurchasePrice('');
    setNotes('');
  };

  const resetForm = () => {
    resetFormState();
    setEditingAsset(null);
    setIsFormOpen(false);
  };

  const formatCurrency = (val: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full max-w-5xl px-4 py-2 mx-auto text-zinc-100 min-h-screen">
      {/* Top Header */}
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Asset Portfolio</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLivePrices}
            disabled={isRefreshingPrices}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white rounded-lg transition"
          >
            <RefreshIcon spinning={isRefreshingPrices} />
            {isRefreshingPrices ? 'Refreshing...' : 'Refresh Prices'}
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 active:scale-95 text-white rounded-lg transition"
          >
            <PlusIcon />
            Add Asset
          </button>
        </div>
      </header>

      {/* History Chart */}
      <div className="mb-8">
        <HistoryChart />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Aggregation and Breakdown */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Net Worth Hero Card */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Net Worth
            </span>
            <div className="mt-2 text-4xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalNetWorth)}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <span>All active accounts & assets</span>
              <span>Updated just now</span>
            </div>
          </div>

          {/* Category Breakdown Card */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-400 mb-4">
              Breakdown by Class
            </h3>
            <div className="flex flex-col gap-4">
              {categoryBreakdown.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.type} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Icon />
                        <span className="font-medium text-zinc-300">{cat.label}</span>
                      </div>
                      <span className="font-semibold text-zinc-200">
                        {formatCurrency(cat.value)} ({cat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.bgClass} transition-all duration-500`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Asset List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-400 mb-4">
              Your Assets
            </h3>

            {assets.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                No assets added yet. Click &quot;Add Asset&quot; to begin.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {assets.map((asset) => {
                  const catConfig = CATEGORY_MAP[asset.type];
                  const Icon = catConfig.icon;
                  return (
                    <div
                      key={asset.id}
                      className="group flex flex-col p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                            <Icon />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-zinc-200">{asset.name}</h4>
                            <p className="text-xs text-zinc-400">
                              {asset.type === 'bank' && asset.details?.institution && (
                                <span>
                                  {asset.details.institution} {asset.details.accountNumber}
                                </span>
                              )}
                              {asset.type === 'real_estate' && asset.details?.location && (
                                <span>
                                  {asset.details.location}
                                  {asset.details.purchasePrice &&
                                    ` • Purchased for ${formatCurrency(asset.details.purchasePrice)}`}
                                </span>
                              )}
                              {asset.type === 'vehicle' &&
                                (asset.details?.modelYear || asset.details?.purchasePrice) && (
                                  <span>
                                    {asset.details.modelYear && `${asset.details.modelYear}`}
                                    {asset.details.modelYear &&
                                      asset.details.purchasePrice &&
                                      ' • '}
                                    {asset.details.purchasePrice &&
                                      `Purchased for ${formatCurrency(asset.details.purchasePrice)}`}
                                  </span>
                                )}
                              {asset.type === 'investment' && asset.details?.symbol && (
                                <span>
                                  {asset.details.symbol} • {asset.details.shares} shares
                                </span>
                              )}
                              {asset.type === 'cash' && (
                                <span className="capitalize">{asset.type}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-sm text-white">
                              {formatCurrency(getEffectiveValue(asset), asset.currency)}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              Updated {new Date(asset.lastUpdated).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleOpenEdit(asset)}
                              className="p-1 hover:bg-zinc-800 rounded transition"
                              title="Edit asset"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="p-1 hover:bg-zinc-800 rounded transition"
                              title="Delete asset"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Display Notes for Physical Assets */}
                      {asset.details?.notes && (
                        <div className="mt-2 text-xs text-zinc-500 border-t border-zinc-900 pt-2 pl-1.5">
                          {asset.details.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Asset Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-850 p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingAsset ? 'Edit Asset' : 'Add Asset'}
            </h3>
            <form onSubmit={handleAddOrEditAsset} className="flex flex-col gap-4">
              {/* Asset Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Primary Savings, Family Home"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                />
              </div>

              {/* Type and Value Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Asset Class
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssetType)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="investment">Investment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                  />
                </div>
              </div>

              {/* Type-Specific Details */}
              {type === 'bank' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Chase Bank"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Account # (Last 4)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* Purchase Price and Details for Physical Assets (Real Estate & Vehicles) */}
              {(type === 'real_estate' || type === 'vehicle') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="e.g. 350000"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                    />
                  </div>
                  {type === 'real_estate' ? (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, State"
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                        Model Year
                      </label>
                      <input
                        type="number"
                        value={modelYear}
                        onChange={(e) => setModelYear(e.target.value)}
                        placeholder="e.g. 2023"
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                      />
                    </div>
                  )}
                </div>
              )}

              {(type === 'real_estate' || type === 'vehicle') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional details..."
                    className="w-full h-20 px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition resize-none"
                  />
                </div>
              )}

              {type === 'investment' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Asset Class
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAssetClass('stock')}
                        className={`flex-1 px-3.5 py-2 text-sm rounded-lg border transition ${
                          assetClass === 'stock'
                            ? 'bg-white text-zinc-950 border-white'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssetClass('crypto')}
                        className={`flex-1 px-3.5 py-2 text-sm rounded-lg border transition ${
                          assetClass === 'crypto'
                            ? 'bg-white text-zinc-950 border-white'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        Crypto
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                        Ticker / Symbol
                      </label>
                      <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder={assetClass === 'crypto' ? 'BTC' : 'VOO'}
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                        Shares
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                        placeholder="e.g. 10.5"
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white text-sm rounded-lg outline-none transition"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-white hover:bg-zinc-100 text-zinc-950 rounded-lg transition"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;
