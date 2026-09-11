import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { api } from '../utils/api';
import type { Asset } from '../types/asset';

vi.mock('../utils/api', () => ({
  api: {
    fetchQuote: vi.fn(),
  },
}));

// Dashboard renders a chart component that isn't relevant to this behavior
// and may pull in its own data dependencies — stub it out.
vi.mock('./HistoryChart', () => ({
  HistoryChart: () => null,
}));

function makeInvestmentAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: 'asset-1',
    name: 'Vanguard S&P 500 ETF',
    type: 'investment',
    value: 5000,
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
    details: {
      symbol: 'VOO',
      assetClass: 'stock',
      shares: 10,
    },
    ...overrides,
  };
}

describe('Dashboard live price fallback', () => {
  beforeEach(() => {
    vi.mocked(api.fetchQuote).mockReset();
  });

  it('uses the live price when the quote fetch succeeds', async () => {
    vi.mocked(api.fetchQuote).mockResolvedValue({
      symbol: 'VOO',
      asset_class: 'stock',
      price: 100,
      cached: false,
    });

    const asset = makeInvestmentAsset();
    render(<Dashboard assets={[asset]} setAssets={vi.fn()} />);

    // 10 shares * $100 live price = $1,000, overriding the stored $5,000 value.
    // This renders in three places at once (net worth hero, breakdown row, asset
    // row), so assert on the count rather than a single ambiguous match.
    await waitFor(() => {
      expect(screen.getAllByText('$1,000').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('$5,000')).not.toBeInTheDocument();
  });

  it('falls back to the stored value when the quote fetch 404s', async () => {
    vi.mocked(api.fetchQuote).mockRejectedValue(new Error('Quote not found for VOO'));

    const asset = makeInvestmentAsset();
    render(<Dashboard assets={[asset]} setAssets={vi.fn()} />);

    await waitFor(() => {
      expect(api.fetchQuote).toHaveBeenCalledWith('VOO', 'stock');
    });

    // Falls back to the stored $5,000 value rather than breaking or showing $0/NaN.
    // Also renders in multiple places (hero, breakdown, asset row).
    await waitFor(() => {
      expect(screen.getAllByText('$5,000').length).toBeGreaterThan(0);
    });
  });

  it('falls back to the stored value when the quote fetch 503s', async () => {
    vi.mocked(api.fetchQuote).mockRejectedValue(new Error('Quote provider unavailable for VOO'));

    const asset = makeInvestmentAsset();
    render(<Dashboard assets={[asset]} setAssets={vi.fn()} />);

    await waitFor(() => {
      expect(api.fetchQuote).toHaveBeenCalledWith('VOO', 'stock');
    });

    await waitFor(() => {
      expect(screen.getAllByText('$5,000').length).toBeGreaterThan(0);
    });
    // Net worth total should also reflect the fallback, not crash or show NaN.
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('does not call fetchQuote for non-investment assets', async () => {
    const cashAsset: Asset = {
      id: 'asset-2',
      name: 'Emergency Fund',
      type: 'cash',
      value: 2000,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
    };

    render(<Dashboard assets={[cashAsset]} setAssets={vi.fn()} />);

    // Give the mount effect a tick to run, then assert it never fired.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(api.fetchQuote).not.toHaveBeenCalled();
  });
});
