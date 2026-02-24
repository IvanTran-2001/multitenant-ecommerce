'use client';
// ^-- to make sure we can mount the Provider from a server component
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

export const { TRPCProvider: TRPCContextProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}
function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    return process.env.NET_PUBLIC_APP_URL;
  })();
  return `${base}/api/trpc`;
}
export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: getUrl(),
        }),
      ],
    }),
  );
  return (
    <TRPCContextProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </TRPCContextProvider>
  );
}