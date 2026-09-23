import type { ApiResponse } from "@/lib/types";
import { getStoredToken } from "@/lib/auth-storage";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY ?? "";

/** Error terstruktur dari API (membawa statusCode & nama error). */
export class ApiError extends Error {
  statusCode: number;
  errorName: string;

  constructor(message: string, statusCode: number, errorName = "Error") {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorName = errorName;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  /** Token eksplisit; jika kosong, diambil dari cookie sesi. */
  token?: string | null;
  /** Body berupa FormData (multipart) — jangan set Content-Type manual. */
  form?: FormData;
  signal?: AbortSignal;
  /** Strategi cache fetch Next.js. Default: no-store (selalu segar). */
  cache?: RequestCache;
}

function buildUrl(path: string, query?: Query): string {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, token, form, signal, cache = "no-store" } = options;

  const headers: Record<string, string> = {};
  if (APP_KEY) headers["x-maker-key"] = APP_KEY;

  const authToken = token !== undefined ? token : getStoredToken();
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  let payload: BodyInit | undefined;
  if (form) {
    payload = form; // biarkan browser set boundary multipart
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      signal,
      cache,
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Periksa koneksi atau base URL API.",
      0,
      "NetworkError",
    );
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    // Respons bukan JSON (mis. 502 dari proxy)
    throw new ApiError(
      `Respons tidak valid dari server (HTTP ${res.status}).`,
      res.status,
      "InvalidResponse",
    );
  }

  if (!res.ok || !json || json.status === false) {
    const message = json?.message ?? `Terjadi kesalahan (HTTP ${res.status}).`;
    const errorName =
      json && json.status === false ? json.error : `HTTP_${res.status}`;
    const code = json?.statusCode ?? res.status;
    throw new ApiError(message, code, errorName);
  }

  return json.data;
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body" | "form">) =>
    request<T>(path, { ...opts, method: "GET" }),

  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "POST", body }),

  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PATCH", body }),

  del: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "DELETE" }),

  /** Upload multipart POST (FormData). */
  postForm: <T>(path: string, form: FormData, opts?: Omit<RequestOptions, "method" | "form" | "body">) =>
    request<T>(path, { ...opts, method: "POST", form }),

  /** Upload multipart PUT (FormData) - UNTUK UPDATE MEMBER */
  putForm: <T>(path: string, form: FormData, opts?: Omit<RequestOptions, "method" | "form" | "body">) =>
    request<T>(path, { ...opts, method: "PUT", form }),
};

export { BASE_URL, APP_KEY };
