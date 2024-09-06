import { ReactNode } from 'react';

interface CardProps {
  children?: ReactNode;
  title?: string;
  open?: boolean;
  collapsible?: boolean;
}

export function Card({ children, title, open = true }: CardProps) {
  if (!title) {
    return (
      <section className="card">
        <div className="card-content">{children}</div>
      </section>
    );
  }
  return (
    <details className="card" open={open}>
      <summary className="card-summary">
        <span className="body1 card-summary-title">{title}</span>
      </summary>
      <div className="card-content">{children}</div>
    </details>
  );
}
