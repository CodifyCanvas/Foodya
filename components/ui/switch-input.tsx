"use client"

import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

// === Type Definitions ===
// Defines the shape of the props the SwitchInput component accepts.
type SwitchInputProps = {
  value: boolean
  onChange: (checked: boolean) => void
  onBlur?: () => void
  name?: string
  id?: string
  ref?: React.Ref<HTMLButtonElement>
  className?: string
}



/**
 * === Controlled switch input with visual ON/OFF icons. ===
 * 
 * Renders an accessible toggle switch using Radix UI, with animated ✔ (on) and ✖ (off) icons.  
 * Fully controlled via `value` and `onChange`, and supports smooth transitions and keyboard interaction.
 *
 * @param value - Current state of the switch (true = ON, false = OFF).
 * @param onChange - Callback fired when the switch state changes.
 * @param onBlur - Optional callback triggered on blur (focus loss).
 * @param name - Optional name for form integration.
 * @param id - Optional unique identifier for the input element.
 * @param ref - Optional forwarded ref for direct DOM access.
 * @param className - Optional custom class names for styling.
 * @returns {JSX.Element} A toggle switch with check/cross icons and transition effects.
 * 
 * @example
 * <SwitchInput
 *   value={isActive}
 *   onChange={setIsActive}
 *   name="status"
 *   className="mt-2"
 * />
 */
const SwitchInput = ({
  value,
  onChange,
  onBlur,
  name,
  ref,
  id,
  className,
}: SwitchInputProps): React.JSX.Element => {

  // === Event Handlers ===
  // We memoize this function to prevent unnecessary re-renders in parent components
  const handleCheckedChange = React.useCallback(
    (checked: boolean) => {
      onChange(checked)
    },
    [onChange]
  )

  return (
    <div className={className}>
      {/* === Outer wrapper to align switch + icons === */}
      <div className="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium">
        {/* === The Switch itself (Radix component) === */}
        <Switch
          checked={value}
          onCheckedChange={handleCheckedChange}
          onBlur={onBlur}
          name={name}
          ref={ref}
          id={id}
          aria-label="Switch with check and cross icons"
          className="
          peer
          absolute inset-0 h-[inherit] w-14
          data-[state=unchecked]:bg-input/50
          [&_span]:z-10
          [&_span]:size-6.5
          [&_span]:transition-transform
          [&_span]:duration-300
          [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)]
          [&_span]:data-[state=checked]:translate-x-7
          [&_span]:data-[state=checked]:rtl:-translate-x-7
        "
        />

        {/* === Cross Icon (Shown when OFF) === */}
        <span
          className="
          pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center
          text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          peer-data-[state=checked]:invisible
          peer-data-[state=unchecked]:translate-x-6
          peer-data-[state=unchecked]:rtl:-translate-x-6
          "
        >
          <XIcon className="size-4 text-black dark:text-white" aria-hidden="true" />
        </span>

        {/* === Check Icon (Shown when ON) === */}
        <span
          className="
            pointer-events-none relative flex min-w-8 items-center justify-center text-center
            transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            peer-data-[state=checked]:text-background
            peer-data-[state=checked]:-translate-x-full
            peer-data-[state=unchecked]:invisible
            peer-data-[state=checked]:rtl:translate-x-full
          "
        >
          <CheckIcon className="size-4 text-white" aria-hidden="true" />
        </span>
      </div>
    </div >
  )
}

export default SwitchInput