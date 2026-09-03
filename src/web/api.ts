import { useEffect, useRef, useState } from 'react';

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/+$/, '')}/api`;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type Params = Record<string, string | number | undefined | null>;

export const apiFetch = async <T>(path: string, params: Params = {}): Promise<T> => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (null != value && '' !== value) {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  const response = await fetch(`${API_BASE}${path}${qs ? `?${qs}` : ''}`, {
    credentials: 'same-origin',
    headers: { accept: 'application/json' },
  });

  if (401 === response.status) {
    // Same origin as SplitPro: bounce to its sign-in page and come back here.
    const callback = encodeURIComponent(window.location.href);
    window.location.assign(`/auth/signin?callbackUrl=${callback}`);
    throw new ApiError(401, 'unauthorized');
  }
  if (!response.ok) {
    // HTTP/2 carries no status text: build a useful message from the status and the JSON body.
    const body = await response.text().catch(() => '');
    let detail = body;
    try {
      detail = (JSON.parse(body) as { error?: string }).error ?? body;
    } catch {
      // not JSON
    }
    throw new ApiError(response.status, `HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
  }
  return (await response.json()) as T;
};

export interface ApiState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/** Fetches on mount and whenever `path`/`params` change; keeps the previous data while reloading. */
export const useApi = <T>(path: string, params: Params = {}, enabled = true): ApiState<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: undefined,
    loading: enabled,
    error: null,
  });
  const key = JSON.stringify([path, params]);
  const latest = useRef(key);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    latest.current = key;
    setState((s) => ({ ...s, loading: true, error: null }));
    apiFetch<T>(path, params)
      .then((data) => {
        if (latest.current === key) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: Error) => {
        if (latest.current === key) {
          setState((s) => ({ ...s, loading: false, error }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return state;
};
