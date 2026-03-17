"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, makeTRPCClient } from "@/lib/trpc";

// trpc.Provider exists at runtime; cast bypasses a TS type-collision in tRPC
// v11 where router-level utils shadow the base Provider property.
const TRPCProvider = (trpc as any).Provider as React.ComponentType<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
  queryClient: QueryClient;
  children: React.ReactNode;
}>;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      }),
  );
  const [trpcClient] = useState(() => makeTRPCClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider client={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
