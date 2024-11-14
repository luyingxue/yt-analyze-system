import React from 'react'
import { useToast } from './use-toast'

export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[200px] rounded-md p-4 shadow-lg transition-all ${
            toast.variant === 'destructive'
              ? 'bg-red-100 text-red-900 border border-red-200'
              : 'bg-green-100 text-green-900 border border-green-200'
          }`}
        >
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  )
} 