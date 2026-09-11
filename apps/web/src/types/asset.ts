/**
 * Unified data model for all wealthdock assets.
 */
export type AssetType = 'bank' | 'cash' | 'real_estate' | 'vehicle' | 'investment';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  currency: string;
  lastUpdated: string;
  details?: {
    institution?: string;
    accountNumber?: string;
    location?: string;
    modelYear?: number;
    symbol?: string;
    assetClass?: 'stock' | 'crypto';
    shares?: number;
    purchasePrice?: number;
    notes?: string;
  };
}

export interface NetWorthSnapshot {
  date: string; // ISO date string (YYYY-MM-DD)
  total: number;
  breakdown: Record<AssetType, number>;
}
