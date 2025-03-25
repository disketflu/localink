import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key]
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = sanitizeObject(value)
      }
      return acc
    }, {} as any)
  }
  
  return obj
} 