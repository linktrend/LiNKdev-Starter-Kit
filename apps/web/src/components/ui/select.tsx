import * as React from "react";
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;
export function Select({ className, children, ...props }: SelectProps) {
  return <select className={className} {...props}>{children}</select>;
}
export default Select;
