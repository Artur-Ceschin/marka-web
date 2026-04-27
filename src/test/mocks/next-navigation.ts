import { vi } from "vitest";

export const useRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
});

export const usePathname = () => "/";
