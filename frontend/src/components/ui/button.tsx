import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "muted";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const buttonVariants = (
  {
    variant = "primary",
    size = "md",
  }: { variant?: ButtonVariant; size?: ButtonSize } = {},
) => {
  const base =
    "inline-flex items-center gap-2 !rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "justify-center bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary:
      "justify-center bg-white text-blue-600 border border-blue-600 hover:bg-blue-50",
    ghost:
      "justify-center bg-transparent text-blue-600 hover:text-blue-800 hover:underline px-0",
    muted:
      "justify-between bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-3",
    lg: "text-base px-5 py-3",
  };

  return cn(base, variantClasses[variant], sizeClasses[size]);
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
