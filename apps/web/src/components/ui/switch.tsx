import * as React from "react";
type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>;
export function Switch({ className, ...props }: SwitchProps) {
  return <input type="checkbox" className={className} {...props} />;
}
export default Switch;
