"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "#252b20",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#FAF8F4",
            fontFamily: "var(--font-body), DM Sans, system-ui, sans-serif",
            fontSize: "14px",
          },
        }}
        gap={8}
      />
    </QueryClientProvider>
  );
}
