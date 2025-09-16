import * as React from "react";
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }
export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }
export default Card;
