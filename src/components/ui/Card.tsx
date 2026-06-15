import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddingStyles = {
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
  none: "p-0",
};

export function Card({
  children,
  hoverable = false,
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-card border border-slate-100 transition-all duration-200",
        hoverable && "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-800", className)}>
      {children}
    </h3>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn("", className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-slate-100 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}
