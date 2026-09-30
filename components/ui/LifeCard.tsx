import React from 'react';
import { cn } from '@/lib/utils';

interface LifeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function LifeCard({ children, className, ...props }: LifeCardProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-2xl border border-border/70 shadow-subtle transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
