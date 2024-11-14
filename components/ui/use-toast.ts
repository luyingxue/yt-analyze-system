import { useState, createContext, useContext, ReactNode, createElement } from 'react'

interface ToastProps {
  id?: number
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

type ToastContextType = {
  toast: (props: ToastProps) => void
  toasts: ToastProps[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    const newToast = {
      ...props,
      id: Date.now(),
    }
    
    setToasts((currentToasts) => [...currentToasts, newToast])
    
    setTimeout(() => {
      setToasts((currentToasts) => 
        currentToasts.filter((t) => t.id !== newToast.id)
      )
    }, 2000)
  }

  const value = {
    toast,
    toasts
  }

  return createElement(ToastContext.Provider, { value }, children)
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
} 