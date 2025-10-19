"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDateWithFns } from "@/lib/date-fns"


type DateInputProps = {
  value?: Date | string
  onChange?: (date?: Date | any) => void
  className?: string
  return?: "date" | "string"  // <- Controls the return type for onChange callback
  now?: boolean
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange'>


export const DateInput = React.forwardRef<HTMLButtonElement, DateInputProps>(({ value, onChange, className, return: returnType = "date", now, ...props }, ref) => {

  const [open, setOpen] = React.useState(false);  // <- Popover open state


  // Convert value prop to a Date object if it's a string
  const dateValue = value instanceof Date ? value : value ? new Date(value) : undefined

  // Auto-select current date if `now` prop is true and no value is passed
  React.useEffect(() => {
    if (now && !value && onChange) {
      const currentDate = new Date()

      // Return either ISO string or Date object based on returnType prop
      const returnValue = returnType === "string" ? currentDate.toISOString() : currentDate

      if (onChange.length === 1) {
        onChange(returnValue)
      } else {
        onChange({ target: { value: returnValue } })
      }
    }
  }, [now, value, onChange, returnType])

  // Called when a date is selected from the calendar
  const handleSelect = (date?: Date) => {
    if (!onChange) return

    const returnValue =
      returnType === "string" && date ? date.toISOString() : date

    // Support both standard and RHF-style onChange handlers
    if (onChange.length === 1) {
      onChange(returnValue)
    } else {
      onChange({ target: { value: returnValue } })
    }

    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant={"outline"}
          className={cn("w-full justify-between font-rubik-400", className)}
          {...props}
        >
          {dateValue ? formatDateWithFns(dateValue) : "Select date"}
          <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">

        {/* Calendar component for date selection */}
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          className="font-rubik"
          captionLayout="dropdown"
          ISOWeek={true}
        />
      </PopoverContent>
    </Popover>
  )
}
)


DateInput.displayName = "DateInput"