import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-travel",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-hero text-white hover:shadow-glow hover:-translate-y-0.5 font-semibold",
        teal: "bg-brand-teal text-white hover:bg-brand-teal/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
        sky: "bg-sky-blue text-white hover:bg-sky-blue/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
        success: "bg-success-green text-white hover:bg-success-green/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
        warning: "bg-warning-orange text-white hover:bg-warning-orange/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
        error: "bg-error-red text-white hover:bg-error-red/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
        glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
      },
      size: {
        default: "h-10 px-4 py-2 font-semibold",
        sm: "h-9 rounded-md px-3 font-medium",
        lg: "h-11 rounded-md px-8 font-semibold text-base",
        xl: "h-14 rounded-lg px-10 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
