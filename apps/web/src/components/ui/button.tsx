import * as React from "react";
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <button ref={ref} className={className} {...props} />
));
Button.displayName = "Button";
export { Button };
export default Button;
