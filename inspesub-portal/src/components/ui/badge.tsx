import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#EFF6FF] text-[#0059A0]",
        secondary: "bg-[#F1F5F9] text-[#475569]",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        error: "bg-red-50 text-red-700",
        orange: "bg-orange-50 text-[#FF7A2F]",
        outline: "border border-[#E5E7EB] text-[#6B7280]",
        pending: "bg-amber-50 text-amber-700",
        active: "bg-emerald-50 text-emerald-700",
        inactive: "bg-[#F1F5F9] text-[#6B7280]",
        rejected: "bg-red-50 text-red-700",
        suspended: "bg-orange-50 text-orange-700",
        approved: "bg-emerald-50 text-emerald-700",
        under_review: "bg-blue-50 text-blue-700",
        submitted: "bg-purple-50 text-purple-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
