import React, { ReactNode } from 'react';
import '@/styles/card.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}