import React from 'react';

export function Card({ className = '', children, ...props }) {
  return <section className={`ui-card ${className}`} {...props}>{children}</section>;
}

export function CardHeader({ className = '', children, ...props }) {
  return <div className={`ui-card-header ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ className = '', children, ...props }) {
  return <h2 className={`ui-card-title ${className}`} {...props}>{children}</h2>;
}

export function CardContent({ className = '', children, ...props }) {
  return <div className={`ui-card-content ${className}`} {...props}>{children}</div>;
}
