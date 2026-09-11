import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api';

function mockFetchOnce(status: number, body: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

describe('ApiClient.fetchQuote', () => {
  beforeEach(() => {
    localStorage.setItem('wealthdock_token', 'test-jwt');
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns the parsed quote on a 200 response', async () => {
    const body = { symbol: 'VOO', asset_class: 'stock', price: 512.34, cached: false };
    mockFetchOnce(200, body);

    const result = await api.fetchQuote('VOO', 'stock');

    expect(result).toEqual(body);
  });

  it('sends the JWT bearer token and correct query params', async () => {
    mockFetchOnce(200, { symbol: 'BTC', asset_class: 'crypto', price: 60000, cached: true });

    await api.fetchQuote('BTC', 'crypto');

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    if (!call) throw new Error('expected fetch to have been called');
    const [url, options] = call;
    expect(String(url)).toContain('symbol=BTC');
    expect(String(url)).toContain('asset_class=crypto');
    expect((options as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-jwt',
    });
  });

  it('throws a not-found error on a 404 response', async () => {
    mockFetchOnce(404, { detail: 'not found' });

    await expect(api.fetchQuote('BOGUS', 'stock')).rejects.toThrow(/not found/i);
  });

  it('throws a provider-unavailable error on a 503 response', async () => {
    mockFetchOnce(503, { detail: 'provider down' });

    await expect(api.fetchQuote('VOO', 'stock')).rejects.toThrow(/unavailable/i);
  });

  it('throws on a 401 response (expired or missing auth)', async () => {
    mockFetchOnce(401, { detail: 'unauthorized' });

    await expect(api.fetchQuote('VOO', 'stock')).rejects.toThrow();
  });
});
