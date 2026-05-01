import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "default" && "bg-ink text-white hover:bg-steel",
        variant === "secondary" && "bg-amber-100 text-amber-900 hover:bg-amber-200",
        variant === "outline" && "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        variant === "destructive" && "bg-danger text-white hover:bg-orange-800",
        className
      )}
      {...props}
    />
  );
}

