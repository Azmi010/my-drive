import type { AuthResponse, AuthUser } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { headers, body, ...rest } = options;

  const res = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => null);
    throw new ApiError(res.status, message || res.statusText);
  }

  return (await res.json()) as T;
}

export const api = {
  register: (data: { email: string; name: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: data }),

  me: (token: string) =>
    request<AuthUser>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
