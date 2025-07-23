"use client"

import React from 'react';
// src/components/ui/toaster.tsx - UPDATED with Modern Design

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  getToastIcon,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div 
              className="flex items-start space-x-4 w-full"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                width: '100%'
              }}
            >
              {/* Modern Icon with Animation */}
              <div 
                className="flex-shrink-0 mt-1"
                style={{
                  flexShrink: 0,
                  marginTop: '0.125rem',
                  animation: 'bounce-in 0.6s ease-out'
                }}
              >
                {getToastIcon(variant)}
              </div>
              
              {/* Content */}
              <div 
                className="flex-1 min-w-0"
                style={{
                  flex: 1,
                  minWidth: 0
                }}
              >
                {title && (
                  <ToastTitle 
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: title && description ? '0.25rem' : '0',
                      color: variant === 'success' ? 'rgb(21, 128, 61)' :
                             variant === 'destructive' ? 'rgb(185, 28, 28)' :
                             variant === 'warning' ? 'rgb(146, 64, 14)' :
                             variant === 'info' ? 'rgb(30, 64, 175)' :
                             'rgb(15, 23, 42)'
                    }}
                  >
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription
                    style={{
                      fontSize: '0.875rem',
                      color: variant === 'success' ? 'rgb(22, 101, 52)' :
                             variant === 'destructive' ? 'rgb(153, 27, 27)' :
                             variant === 'warning' ? 'rgb(120, 53, 15)' :
                             variant === 'info' ? 'rgb(30, 58, 138)' :
                             'rgb(51, 65, 85)'
                    }}
                  >
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
      
      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-in-from-top {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-out-to-right {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* Enhanced toast animations */
        [data-state="open"] {
          animation: slide-in-from-top 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        [data-state="closed"] {
          animation: slide-out-to-right 0.3s ease-in;
        }

        /* Glassmorphism enhancement */
        [data-radix-toast-viewport] {
          backdrop-filter: blur(8px);
        }
      `}</style>
    </ToastProvider>
  )
}