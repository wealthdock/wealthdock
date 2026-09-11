// API Client layer to communicate with wealthdock-server

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  email: string;
}

export interface SyncPayload {
  payload: string;
}

export interface QuoteResponse {
  symbol: string;
  asset_class: 'stock' | 'crypto';
  price: number;
  cached: boolean;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('wealthdock_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3s timeout
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data: AuthResponse = await res.json();
    localStorage.setItem('wealthdock_token', data.access_token);
    localStorage.setItem('wealthdock_email', data.email);
    return data;
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Registration failed');
    }

    const data: AuthResponse = await res.json();
    localStorage.setItem('wealthdock_token', data.access_token);
    localStorage.setItem('wealthdock_email', data.email);
    return data;
  }

  logout(): void {
    localStorage.removeItem('wealthdock_token');
    localStorage.removeItem('wealthdock_email');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('wealthdock_token');
  }

  getEmail(): string | null {
    return localStorage.getItem('wealthdock_email');
  }

  async fetchSync(): Promise<string | null> {
    const res = await fetch(`${API_BASE_URL}/sync`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error('Sync fetch failed');
    }

    const data: SyncPayload = await res.json();
    return data.payload;
  }

  async fetchQuote(symbol: string, assetClass: 'stock' | 'crypto'): Promise<QuoteResponse> {
    const params = new URLSearchParams({ symbol, asset_class: assetClass });
    const res = await fetch(`${API_BASE_URL}/market-data/quote?${params.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Quote not found for ${symbol}`);
      }
      if (res.status === 503) {
        throw new Error(`Quote provider unavailable for ${symbol}`);
      }
      throw new Error('Quote fetch failed');
    }

    return res.json();
  }

  async saveSync(payload: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ payload }),
    });

    if (!res.ok) {
      throw new Error('Sync save failed');
    }
  }
}

export const api = new ApiClient();
export default api;
