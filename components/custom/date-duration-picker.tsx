"use client"

import * as React from "react"
import { useFormContext, Controller } from "react-hook-form"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { formatDateWithFns } from "@/lib/date-fns"



type Props = {
  nameStart: string
  nameEnd: string
  firstLabel?: string
  secondLabel?: string
}



/**
 * === Controlled date and time range picker integrated with React Hook Form. ===
 * 
 * Provides a UI to select a start and end date/time, with a calendar popover for dates 
 * and time inputs for precise hours and minutes. Automatically updates the end time 
 * to one hour after the selected start time when a new date is chosen.
 *
 * @param nameStart - Form field name for the start date/time.
 * @param nameEnd - Form field name for the end date/time.
 * @param firstLabel - Optional label for the start time input (default: "Start Time").
 * @param secondLabel - Optional label for the end time input (default: "End Time").
 * @returns {JSX.Element} A date-time range picker with popover calendar and controlled time inputs.
 * 
 * @example
 * <FormProvider {...methods}>
 *   <DateTimeRangePicker
 *     nameStart="eventStart"
 *     nameEnd="eventEnd"
 *     firstLabel="Start"
 *     secondLabel="End"
 *   />
 * </FormProvider>
 */
export function DateTimeRangePicker({
  nameStart,
  nameEnd,
  firstLabel,
  secondLabel,
}: Props): React.JSX.Element {
  const { control, setValue } = useFormContext()

  const getTimeValue = (date: Date | string | null | undefined) => {
    const validDate = new Date(date || new Date())
    return validDate.toTimeString().slice(0, 5)
  }

  return (
    <div className="flex-col gap-4 w-full">

      {/* === Date Picker === */}
      <div className="flex flex-col gap-3 w-full">
        <Controller
          name={nameStart}
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between font-rubik-400"
                >
                  {field.value
                    ? formatDateWithFns(new Date(field.value))
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  captionLayout="dropdown"
                  onSelect={(selectedDate) => {
                    if (!selectedDate) return

                    const existing = new Date(field.value || new Date())
                    const combinedStart = new Date(selectedDate)
                    combinedStart.setHours(
                      existing.getHours(),
                      existing.getMinutes()
                    )

                    setValue(nameStart, combinedStart)
                    setValue(nameEnd, new Date(combinedStart.getTime() + 60 * 60 * 1000))
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      {/* === Time Inputs === */}
      <div className="flex flex-row gap-2 mt-5 w-full">

        {/* === Start Time === */}
        <div className="flex flex-col group relative w-full gap-3">
          <Label htmlFor="time-from" className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs" >
            {firstLabel || "Start Time"}
          </Label>
          <Controller
            name={nameStart}
            control={control}
            render={({ field, fieldState }) => {
              const date = new Date(field.value || new Date())
              return (
                <div className="flex flex-col gap-1 w-full">
                  <Input
                    type="time"
                    step="60"
                    id="time-from"
                    value={getTimeValue(date)}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number)
                      const updated = new Date(date)
                      updated.setHours(h, m)
                      setValue(nameStart, updated)
                    }}
                  />
                  {fieldState.error && (
                    <span className="text-sm text-destructive">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )
            }}
          />
        </div>

        {/* === End Time === */}
        <div className="flex flex-col group relative w-full gap-3">
          <Label htmlFor="time-to" className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs" >
            {secondLabel || "End Time"}
          </Label>
          <Controller
            name={nameEnd}
            control={control}
            render={({ field, fieldState }) => {
              const date = new Date(field.value || new Date())
              return (
                <div className="flex flex-col gap-1 w-full">
                  <Input
                    type="time"
                    step="60"
                    id="time-to"
                    value={getTimeValue(date)}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number)
                      const updated = new Date(date)
                      updated.setHours(h, m)
                      setValue(nameEnd, updated)
                    }}
                  />
                  {fieldState.error && (
                    <span className="text-sm text-destructive">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )
            }}
          />
        </div>
      </div>
    </div >
  )
}