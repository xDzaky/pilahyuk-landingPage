// src/components/dashboard/AnswerBanner.tsx
"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface AnswerBannerProps {
  answer: string
  subtext?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  variant?: "dark" | "warning" | "calm"
  compact?: boolean
  className?: string
}

export function AnswerBanner({
  answer,
  subtext,
  icon: Icon,
  actions,
  variant = "dark",
  compact = false,
  className,
}: AnswerBannerProps) {
  return (
    <div
      className={cn(
        "relative rounded-[16px] overflow-hidden",
        compact ? "px-5 py-3.5" : "px-5 py-4",
        variant === "dark" && "bg-[#173F35] text-white brand-motif border-l-[3px] border-l-[#DDF3EC]",
        variant === "warning" && "bg-[#FBF1DF] border border-[#F3DFBD]",
        variant === "calm" && "bg-white border border-[#E1E8E3]",
        className
      )}
    >
      <div className={cn(
        "flex gap-4",
        compact ? "items-center" : "items-start"
      )}>
        <div className={cn(
          "flex gap-3 flex-1 min-w-0",
          compact ? "items-center" : "items-start"
        )}>
          {Icon && (
            <div className={cn(
              "p-1.5 rounded-xl shrink-0",
              variant === "dark" && "bg-white/10",
              variant === "warning" && "bg-[#A86712]/10",
              variant === "calm" && "bg-[#F6F8F5]",
            )}>
              <Icon className={cn(
                "w-4 h-4",
                variant === "dark" && "text-[#DDF3EC]",
                variant === "warning" && "text-[#A86712]",
                variant === "calm" && "text-[#3D9274]",
              )} />
            </div>
          )}

          <div className="min-w-0">
            <p className={cn(
              "font-bold leading-tight",
              compact ? "text-sm" : "text-base",
              variant === "dark" ? "text-white" : "text-[#1E2925]",
              variant === "warning" && "text-[#A86712]",
            )}>
              {answer}
            </p>
            {!compact && subtext && (
              <p className={cn(
                "mt-0.5 text-xs",
                variant === "dark" && "text-[#DDF3EC]/70",
                variant === "warning" && "text-[#A86712]/80",
                variant === "calm" && "text-[#66736D]",
              )}>
                {subtext}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="shrink-0 flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
