import * as React from 'react';
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button className="inline-flex items-center rounded-md border px-3 py-2 text-sm" {...props}>{children}</button>
);
