import { getValidToken } from "./auth";

const BASE =
  process.env.NEXT_PUBLIC_REST_API_URL ?? "http://127.0.0.1:8080";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getValidToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: await authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API ${method} ${path} → ${res.status}`);
  }

  return res.json() as Promise<T>;
}

async function multipart<T>(path: string, formData: FormData): Promise<T> {
  const token = await getValidToken();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    throw new ApiError(res.status, `API POST ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  plantCount: number;
  weekCount: number;
  seasonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileBody {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AvatarUploadResponse {
  uploadUrl: string;
  key: string;
}

export interface NotebookEntry {
  id: string;
  plantName: string;
  latinName: string;
  imageUrl: string | null;
  note: string | null;
  confidence: number | null;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  plantName: string;
  latinName: string;
  imageUrl: string | null;
  note: string | null;
  confidence: number;
  likesCount: number;
  likedByMe: boolean;
  location: string | null;
  createdAt: string;
}

export interface IdentifyResult {
  name: string;
  latinName: string;
  confidence: number;
  description: string | null;
  imageUrl: string | null;
}

export interface IdentifyResponse {
  results: IdentifyResult[];
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = {
  me: () => request<UserProfile>("GET", "/users/me"),

  updateMe: (body: UpdateProfileBody) =>
    request<UserProfile>("PUT", "/users/me", body),

  avatarUploadUrl: () =>
    request<AvatarUploadResponse>("POST", "/users/me/avatar"),

  getById: (id: string) => request<UserProfile>("GET", `/users/${id}`),
};

// ─── Notebook ─────────────────────────────────────────────────────────────────

export const notebook = {
  list: () => request<NotebookEntry[]>("GET", "/notebook"),

  getById: (id: string) => request<NotebookEntry>("GET", `/notebook/${id}`),

  delete: (id: string) => request<void>("DELETE", `/notebook/${id}`),
};

// ─── Feed ─────────────────────────────────────────────────────────────────────

export const feed = {
  list: () => request<FeedItem[]>("GET", "/feed"),

  like: (id: string) => request<void>("POST", `/feed/${id}/like`),

  unlike: (id: string) => request<void>("DELETE", `/feed/${id}/like`),
};

// ─── Identify ─────────────────────────────────────────────────────────────────

export const identify = {
  fromImage: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return multipart<IdentifyResponse>("/identify", fd);
  },
};
