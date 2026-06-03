import React, { useMemo } from "react";
import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider
} from "@tanstack/react-query";
import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer";
import { buildFbsConfigForReact } from "../core/utils/service-layer";

// /react ships its own legacy react-query@3 QueryClientProvider in
// components/store.tsx. The service-layer hooks are built on
// @tanstack/react-query@5 and need their own client + provider. This wrapper
// mounts both alongside the existing tree.
const tanstackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 120
    }
  }
});

interface Props {
  children: React.ReactNode;
}

const ServiceLayerProviderWrapper: React.FC<Props> = ({ children }) => {
  // FbsConfig reads the user token at call time so it stays in sync with the
  // redux store/token cookies; we just need a stable reference here.
  const fbs = useMemo(() => buildFbsConfigForReact(), []);
  return (
    <TanstackQueryClientProvider client={tanstackQueryClient}>
      <ServiceLayerProvider fbs={fbs}>{children}</ServiceLayerProvider>
    </TanstackQueryClientProvider>
  );
};

export default ServiceLayerProviderWrapper;
