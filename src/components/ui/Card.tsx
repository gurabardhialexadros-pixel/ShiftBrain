import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export default function Card({
  children,
  elevated = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={["glass-card p-4", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
