// src/components/ui/toast.tsx - UPDATED with Modern Design
"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-auto sm:right-4 sm:top-4 sm:flex-col md:max-w-[420px]",
      className
    )}
    style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      maxHeight: '100vh',
      width: '100%',
      maxWidth: '26rem',
      flexDirection: 'column',
      padding: '1rem',
      gap: '0.5rem'
    }}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl p-6 pr-8 shadow-2xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full border-2",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-white/95 text-slate-950 backdrop-blur-xl",
        destructive:
          "destructive group border-red-200 bg-red-50/95 text-red-900 backdrop-blur-xl shadow-red-500/10",
        success:
          "border-green-200 bg-green-50/95 text-green-900 backdrop-blur-xl shadow-green-500/10",
        warning:
          "border-yellow-200 bg-yellow-50/95 text-yellow-900 backdrop-blur-xl shadow-yellow-500/10",
        info:
          "border-blue-200 bg-blue-50/95 text-blue-900 backdrop-blur-xl shadow-blue-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      style={{
        borderRadius: '1rem',
        padding: '1.5rem',
        backgroundColor: variant === 'success' ? 'rgba(240, 253, 244, 0.98)' :
                        variant === 'destructive' ? 'rgba(254, 242, 242, 0.98)' :
                        variant === 'warning' ? 'rgba(254, 252, 232, 0.98)' :
                        variant === 'info' ? 'rgba(239, 246, 255, 0.98)' :
                        'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        border: `2px solid ${
          variant === 'success' ? 'rgba(34, 197, 94, 0.2)' :
          variant === 'destructive' ? 'rgba(239, 68, 68, 0.2)' :
          variant === 'warning' ? 'rgba(245, 158, 11, 0.2)' :
          variant === 'info' ? 'rgba(59, 130, 246, 0.2)' :
          'rgba(148, 163, 184, 0.2)'
        }`,
        boxShadow: `0 25px 50px -12px ${
          variant === 'success' ? 'rgba(34, 197, 94, 0.15)' :
          variant === 'destructive' ? 'rgba(239, 68, 68, 0.15)' :
          variant === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
          variant === 'info' ? 'rgba(59, 130, 246, 0.15)' :
          'rgba(0, 0, 0, 0.15)'
        }, 0 0 0 1px rgba(255, 255, 255, 0.1)`,
        minHeight: '4rem',
        position: 'relative'
      }}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    style={{
      position: 'absolute',
      right: '0.75rem',
      top: '0.75rem',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      transition: 'all 0.2s ease',
      opacity: 0.7
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.opacity = '1'
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
      e.currentTarget.style.transform = 'scale(1.1)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.opacity = '0.7'
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
      e.currentTarget.style.transform = 'scale(1)'
    }}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-lg font-bold leading-tight [&+div]:text-xs", className)}
    style={{
      fontSize: '1.125rem',
      fontWeight: '700',
      lineHeight: '1.3',
      marginBottom: '0.25rem'
    }}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    style={{
      fontSize: '0.875rem',
      opacity: 0.85,
      lineHeight: '1.4'
    }}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Enhanced Toast Hook with Icons
const getToastIcon = (variant?: string) => {
  switch (variant) {
    case 'success':
      return <CheckCircle className="h-6 w-6 text-green-600" />
    case 'destructive':
      return <AlertCircle className="h-6 w-6 text-red-600" />
    case 'warning':
      return <AlertTriangle className="h-6 w-6 text-yellow-600" />
    case 'info':
      return <Info className="h-6 w-6 text-blue-600" />
    default:
      return <Info className="h-6 w-6 text-slate-600" />
  }
}

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  getToastIcon,
}