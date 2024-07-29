import { Suspense } from 'react';

export default function LazyLoadComponent({
  children,
  fallback = <span>...</span>,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
