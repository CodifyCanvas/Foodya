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
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange'>

export const DateInput = React.forwardRef<HTMLButtonElement, DateInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);

    // Convert value to Date if needed
    const dateValue = value instanceof Date ? value : value ? new Date(value) : undefined

    const handleSelect = (date?: Date) => {
      if (!onChange) return
      // Detect if onChange expects an event (like RHF)
      if (onChange.length === 1) {
        onChange(date)
      } else {
        // Simulate event object if needed
        onChange({ target: { value: date } })
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
