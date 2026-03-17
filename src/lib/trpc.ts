import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "marka-api";
import { getValidToken } from "./auth";

export const trpc = createTRPCReact<AppRouter>();

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://8k5jmqox8h.execute-api.us-east-1.amazonaws.com/dev/trpc";

export function makeTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: API_URL,
        async headers() {
          const token = await getValidToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
