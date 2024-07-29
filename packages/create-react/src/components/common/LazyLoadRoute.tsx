import { Suspense } from 'react';

export function LazyLoadRoute({
  children,
  fallback = <span>...</span>,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
