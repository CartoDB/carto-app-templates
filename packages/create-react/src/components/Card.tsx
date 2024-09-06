import { ReactNode } from 'react';

interface CardProps {
  children?: ReactNode;
  title?: string;
  open?: boolean;
  collapsible?: boolean;
  className?: string;
}

export function Card({
  children,
  title,
  className = '',
  open = true,
}: CardProps) {
  if (!title) {
    return (
      <section className={`card ${className}`}>
        <div className="card-content">{children}</div>
      </section>
    );
  }
  return (
    <details className={`card ${className}`} open={open}>
      <summary className="card-summary">
        <span className="body1 card-summary-title">{title}</span>
      </summary>
      <div className="card-content">{children}</div>
    </details>
  );
}
