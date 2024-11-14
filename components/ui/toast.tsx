import * as React from "react"
import { cn } from "@/lib/utils"
import { ToastProvider as InternalToastProvider } from "./use-toast"

interface ToastProps {
  id?: number
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'default'
}) => {
  const baseStyles = "fixed bottom-4 right-4 z-50 min-w-[200px] rounded-md p-4 shadow-lg transition-all"
  const variantStyles = {
    default: "bg-green-100 text-green-900 border border-green-200",
    destructive: "bg-red-100 text-red-900 border border-red-200"
  }

  return (
    <div className={cn(baseStyles, variantStyles[variant])}>
      <div className="font-medium">{title}</div>
      {description && (
        <div className="text-sm opacity-90">{description}</div>
      )}
    </div>
  )
}

export const ToastProvider = InternalToastProvider