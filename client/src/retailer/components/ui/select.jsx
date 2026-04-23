import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown, Check } from "lucide-react"

const Select = ({ children, onValueChange, defaultValue, value, placeholder, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || value || "")
  const [selectedLabel, setSelectedLabel] = React.useState("")

  const handleValueChange = (newValue, label) => {
    setSelectedValue(newValue)
    setSelectedLabel(label)
    setIsOpen(false)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            selectedLabel,
            selectedValue,
            placeholder
          })
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            handleValueChange,
            selectedValue,
            placeholder
          })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, isOpen, setIsOpen, selectedLabel, placeholder, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <span className={selectedLabel ? "text-gray-900" : "text-gray-400"}>
      {selectedLabel || placeholder || "Select an option..."}
    </span>
    <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => (
  <span ref={ref} className={cn("text-gray-400", className)} {...props}>
    {placeholder || "Select an option..."}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, isOpen, handleValueChange, selectedValue, placeholder, ...props }, ref) => {
  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] w-full mt-1 overflow-hidden rounded-md border bg-white text-gray-900 shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="max-h-60 overflow-y-auto">
        {/* Add placeholder option */}
        <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-3 pr-8 text-sm text-gray-400 opacity-50">
          {placeholder || "Select an option..."}
        </div>
        {React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              handleValueChange,
              selectedValue
            })
          }
          return child
        })}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, handleValueChange, selectedValue, ...props }, ref) => (
  <div
    ref={ref}
    onClick={() => handleValueChange(value, children)}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-8 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
      selectedValue === value && "bg-blue-50 text-blue-600",
      className
    )}
    {...props}
  >
    {children}
    {selectedValue === value && (
      <Check className="absolute right-2 h-4 w-4" />
    )}
  </div>
))
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
