"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "./badge"



// === Type Definitions ===
interface ComboboxInputProps {
    options: { value: string; label: string; badge?: string }[];
    placeholder?: string;
    onSelect: (value: string | "") => void;
    value: string;
    className?: string;
}



/**
 * === Searchable combobox with optional badges and selection indicator. ===
 * 
 * Displays a searchable dropdown using Radix UI popovers and command primitives.  
 * Allows users to select one option from a provided list, with optional badges beside labels.
 *
 * @param options - Array of selectable items `{ value, label, badge? }`.
 * @param placeholder - Placeholder text when no option is selected (optional).
 * @param onSelect - Callback fired when an option is chosen.
 * @param value - Currently selected option value (controlled).
 * @param className - Optional custom class names for styling.
 * @returns {JSX.Element} A controlled combobox input with search and badge support.
 * 
 * @example
 * <ComboboxInput
 *   options={[{ value: "apple", label: "Apple" }, { value: "banana", label: "Banana" }]}
 *   value={selected}
 *   onSelect={setSelected}
 *   placeholder="Choose a fruit"
 * />
 */
export function ComboboxInput({
    options,
    placeholder = "Select an option",
    onSelect,
    value,
    className,
}: ComboboxInputProps): React.JSX.Element {

    // === Local State ===
    const [open, setOpen] = React.useState(false)

    // === Memoized Computations ===
    // Find the currently selected option only when "value" or "options" changes
    const selectedOption = React.useMemo(
        () => options.find((opt) => opt.value === value),
        [options, value]
    )

    // === Handlers ===
    // Handle when an item is selected from the dropdown
    const handleSelect = React.useCallback(
        (selectedValue: string) => {
            onSelect(selectedValue)
            setOpen(false) // close the dropdown
        },
        [onSelect]
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            {/* === Button that triggers the dropdown === */}
            <PopoverTrigger asChild className={className}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between capitalize font-rubik-400",
                        value ? "text-black" : "text-neutral-500"
                    )}
                >
                    {/* === Show selected label or placeholder === */}
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>

            {/* === Dropdown Content === */}
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    {/* === Search input inside dropdown === */}
                    <CommandInput placeholder="Search..." className="h-9" />

                    <CommandList className="font-rubik-400 scroll-bar">
                        <CommandEmpty>Not found.</CommandEmpty>

                        {/* === List of options === */}
                        <CommandGroup>
                            {options.map((item) => {
                                const isSelected = value === item.value
                                return (
                                    <CommandItem
                                        key={item.value}
                                        value={item.label.toLowerCase()}
                                        onSelect={() => handleSelect(item.value)}
                                        className="capitalize"
                                    >
                                        {item.label}

                                        {/* === Optional badge === */}
                                        {item.badge && (
                                            <Badge
                                                className={cn(
                                                    "rounded-full ml-auto font-rubik-400 border-none bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400 min-w-fit"
                                                )}
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}

                                        {/* === Checkmark if selected === */}
                                        <Check
                                            className={cn(
                                                isSelected ? "opacity-100" : "opacity-0",
                                                !item.badge && "ml-auto"
                                            )}
                                        />
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
