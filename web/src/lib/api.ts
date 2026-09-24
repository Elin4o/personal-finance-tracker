const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          setAccessToken(null);
          return null;
        }

        const data = (await response.json()) as { accessToken: string };
        setAccessToken(data.accessToken);
        return data.accessToken;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function rawFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const token = getAccessToken();

  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  let response = await rawFetch<T>(path, options);

  if (response.status === 401 && path !== "/auth/refresh") {
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await rawFetch<T>(path, options);
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      setAccessToken(null);
    }

    throw new ApiError(
      response.status,
      `API request failed: ${response.status}`,
    );
  }
  return response.json();
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, {
    method: "GET",
  });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    ...(body !== undefined
      ? {
          body: JSON.stringify(body),
        }
      : {}),
  });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "PATCH",
    ...(body !== undefined
      ? {
          body: JSON.stringify(body),
        }
      : {}),
  });
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiFetch<T>(path, {
    method: "DELETE",
  });
}
