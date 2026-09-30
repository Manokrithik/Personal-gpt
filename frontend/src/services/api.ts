const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('personalgpt_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errData: any = {};
    try {
      errData = await res.json();
    } catch {
      errData = { message: res.statusText };
    }

    let parsedMessage = 'API request failed';
    if (typeof errData.detail === 'string') {
      parsedMessage = errData.detail;
    } else if (Array.isArray(errData.detail)) {
      parsedMessage = errData.detail
        .map((e: any) => {
          if (typeof e === 'string') return e;
          const field = Array.isArray(e.loc) && e.loc.length > 0 ? e.loc[e.loc.length - 1] : '';
          const msg = e.msg ? e.msg.replace(/^Value error,\s*/i, '') : 'Invalid value';
          return field ? `${field}: ${msg}` : msg;
        })
        .join('. ');
    } else if (errData.detail && typeof errData.detail === 'object') {
      parsedMessage = errData.detail.msg || errData.detail.message || JSON.stringify(errData.detail);
    } else if (typeof errData.message === 'string') {
      parsedMessage = errData.message;
    }

    throw new ApiError(parsedMessage, res.status, errData);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}
