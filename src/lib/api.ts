import { toast } from "sonner";
import { getCurrentSession } from "./auth";

const BASE = process.env.NEXT_PUBLIC_REST_API_URL ?? "http://127.0.0.1:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function friendlyError(status: number): string {
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 429) return "Too many requests. Please wait a moment.";
  if (status >= 500) return "Something went wrong on our end. Please try again.";
  return "Something went wrong. Please try again.";
}

function handleUnauthorized(): never {
  if (typeof window !== "undefined") {
    const { useAuthStore } = require("@/store/auth.store");
    useAuthStore.getState().logout();
    toast.error("Session expired. Please sign in again.");
    window.location.replace("/signin");
  }
  throw new ApiError(401, "Session expired");
}

async function ensureAuth(): Promise<string> {
  const session = await getCurrentSession();
  if (!session) handleUnauthorized();
  return session.idToken;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: { silent404?: boolean } = {},
): Promise<T> {
  const token = await ensureAuth();

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    toast.error("Network error. Check your connection and try again.");
    throw new ApiError(0, "Network error");
  }

  if (res.status === 401) handleUnauthorized();

  if (!res.ok) {
    if (res.status === 429) {
      let body: { message?: string; code?: string } = {};
      try {
        body = await res.json();
      } catch {}
      const msg = body.message ?? friendlyError(429);
      if (!body.code) toast.error(msg);
      throw new ApiError(429, msg, body.code);
    }
    const msg = friendlyError(res.status);
    if (!(opts.silent404 && res.status === 404)) toast.error(msg);
    throw new ApiError(res.status, msg);
  }

  return res.json() as Promise<T>;
}

async function multipart<T>(path: string, formData: FormData): Promise<T> {
  const token = await ensureAuth();

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    toast.error("Network error. Check your connection and try again.");
    throw new ApiError(0, "Network error");
  }

  if (res.status === 401) handleUnauthorized();

  if (!res.ok) {
    const msg = friendlyError(res.status);
    toast.error(msg);
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  isPremium?: boolean;
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
  avatarUrl: string;
}

export interface NotebookEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  plantName: string;
  latinName: string;
  confidence: number;
  imageUrl: string;
  tags: string[];
  notes?: string;
  location?: { lat: number; lng: number; place: string };
  likeCount: number;
  identifiedAt: string;
  entityType: "NOTEBOOK_ENTRY";
}

/** Enriched response returned by GET /notebook/:id */
export interface NotebookEntryDetail extends NotebookEntry {
  plant: Plant | null;
}

export interface NotebookListResponse {
  items: NotebookEntry[];
  cursor: string | null;
}

export interface SaveNotebookBody {
  plantName: string;
  latinName: string;
  confidence: number;
  imageUrl: string;
  tags?: string[];
  notes?: string;
  location?: { lat: number; lng: number; place: string };
  identifiedAt?: string;
}

export interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  plantName: string;
  latinName: string;
  confidence: number;
  imageUrl: string;
  tags: string[];
  notes?: string;
  location?: { lat: number; lng: number; place: string };
  likeCount: number;
  identifiedAt: string;
  entityType: "NOTEBOOK_ENTRY";
}

export interface IdentifyResult {
  name: string;
  latin: string;
  confidence: number;
  family: string;
  genus?: string;
  commonNames?: string[];
  tags: string[];
  imageUrl?: string;
  description?: string;
  referenceImages?: Array<{ url: string; organ: string }>;
}

export interface IdentifyResponse {
  results: IdentifyResult[];
  imageUrl: string;
}

export interface SubmitResponse {
  imageUrl: string;
  displayUrl?: string;
  results: IdentifyResult[];
}

export interface Plant {
  latinName: string;
  commonName: string;
  family: string;
  genus?: string;
  commonNames?: string[];
  scientificNameAuthorship?: string;
  description?: string;
  tags?: string[];
  nativeRegions?: string[];
  isInvasive?: boolean;
  imageUrl?: string;
  referenceImages?: Array<{ url: string; organ: string }>;
  entityType: "PLANT";
}

export interface NearbyPlant {
  latin: string;
  common: string;
  family: string;
  biomes?: string[];
  imageUrl?: string;
  occurrenceCount: number;
}

export interface NearbyPlantsPage {
  plants: NearbyPlant[];
  page: number;
  hasMore: boolean;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = {
  me: () => request<UserProfile>("GET", "/users/me"),

  updateMe: (body: UpdateProfileBody) => request<UserProfile>("PUT", "/users/me", body),

  avatarUploadUrl: (mimeType: string) =>
    request<AvatarUploadResponse>("POST", "/users/me/avatar", { mimeType }),

  getById: (id: string) => request<UserProfile>("GET", `/users/${id}`),
};

// ─── Notebook ─────────────────────────────────────────────────────────────────

export const notebook = {
  list: (cursor?: string, limit = 20) =>
    request<NotebookListResponse>(
      "GET",
      `/notebook?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`,
    ),

  getById: (id: string) => request<NotebookEntryDetail>("GET", `/notebook/${id}`),

  save: (body: SaveNotebookBody) => request<NotebookEntry>("POST", "/notebook", body),

  updateNotes: (id: string, notes: string) =>
    request<NotebookEntry>("PUT", `/notebook/${id}/notes`, { notes }),

  delete: (id: string) => request<void>("DELETE", `/notebook/${id}`),
};

// ─── Feed ─────────────────────────────────────────────────────────────────────

export const feed = {
  list: (cursor?: string, limit = 20) =>
    request<{ items: FeedItem[]; cursor: string | null }>(
      "GET",
      `/feed?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`,
    ),

  like: (entryId: string, entryOwnerId: string) =>
    request<{ liked: boolean; likeCount: number }>("POST", `/feed/${entryId}/like`, {
      entryOwnerId,
    }),
};

// ─── Identify ─────────────────────────────────────────────────────────────────

export const identify = {
  // Submit a local File: converts to base64 and sends to API in one step
  submit: async (file: File, lang = "en"): Promise<SubmitResponse> => {
    const raw = file.type?.toLowerCase() ?? "";
    const mimeType =
      raw === "image/jpeg" || raw === "image/png" || raw === "image/webp"
        ? (raw as "image/jpeg" | "image/png" | "image/webp")
        : "image/jpeg";
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return request<SubmitResponse>("POST", "/identify/submit", { base64, mimeType, lang });
  },

  save: (body: SaveNotebookBody) => request<NotebookEntry>("POST", "/identify/save", body),

  // Public one-shot (no auth, no rate limit)
  fromUrl: (imageUrl: string, lang = "en") =>
    request<IdentifyResponse>("POST", "/identify", { type: "url", imageUrl, lang }),
};

// ─── Plants ───────────────────────────────────────────────────────────────────

export const plants = {
  getByLatin: (latin: string) =>
    request<Plant>("GET", `/plants/${encodeURIComponent(latin)}`, undefined, { silent404: true }),
};

// ─── Explore ──────────────────────────────────────────────────────────────────

export const explore = {
  nearby: (lat: number, lng: number, page = 0, radius = 10) =>
    request<NearbyPlantsPage>(
      "GET",
      `/explore/nearby?lat=${lat}&lng=${lng}&radius=${radius}&page=${page}`,
    ),
};
