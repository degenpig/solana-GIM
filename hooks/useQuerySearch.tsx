import React from 'react';
import { useRouter } from 'next/router'

export function useQuerySearch() {
  // TODO: does this work as substitute for react-router-dom/useLocation?
  const router = useRouter();
  // `router.query as any` shouldn't be anytyped, fix required
  return React.useMemo(() => new URLSearchParams(router.query as any), [router.query]);
}


