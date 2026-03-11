import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1F2937]"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-9 w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF]",
              "border-[#E5E7EB] transition-all duration-150",
              "focus:outline-none focus:border-[#0B7FC1] focus:ring-2 focus:ring-[#0B7FC1]/10",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F9FAFB]",
              "read-only:bg-[#F9FAFB] read-only:cursor-default",
              error && "border-red-400 focus:border-red-400 focus:ring-red-400/10",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
