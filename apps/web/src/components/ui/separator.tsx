import * as React from "react";
export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={className} {...props} />;
}
export default Separator;
