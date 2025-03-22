import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface BaseInputProps {
  label?: string
  error?: string
  helperText?: string
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseInputProps {}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {}

const baseStyles = "block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const errorStyles = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          className={cn(baseStyles, errorStyles, className)}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={cn(
              "mt-1 text-sm",
              error ? "text-red-600" : "text-gray-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const errorStyles = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          className={cn(baseStyles, errorStyles, className)}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={cn(
              "mt-1 text-sm",
              error ? "text-red-600" : "text-gray-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
Textarea.displayName = "Textarea"

export { Input, Textarea } 