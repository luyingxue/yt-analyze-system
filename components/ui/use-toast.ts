import { useState } from 'react'

interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = 'default' }: Toast) => {
    // 在实际应用中，这里应该显示一个真实的 toast 通知
    console.log({ title, description, variant })
  }

  return { toast }
} 