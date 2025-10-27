import * as React from "react"
import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  variant?: "default" | "minimal"
}

function Input({
  className,
  type = "text",
  variant = "default",
  ...props
}: InputProps) {
  const baseStyles = cn(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-emerald-300 selection:text-black disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "file:inline-flex font-rubik-400 text-sm file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium"
  )

  const variants = {
    default: cn(
      "dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
    ),
    minimal: cn(
      "bg-transparent border-0 border-b-0 text-sm px-0 py-1 outline-none w-full transition-all",
      "focus:border-b focus:border-neutral-500", // ← show bottom border only on focus
      "placeholder:text-muted-foreground"
    ),
  }


  return (
    <input
      type={type}
      data-slot="input"
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  )
}

export { Input }
