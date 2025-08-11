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

interface ComboboxInputProps {
    options: { value: string; label: string, badge?: string }[];
    placeholder?: string;
    onSelect: (value: string | "") => void; // ← changed here
    value: string;
    className?: string;
}

export function ComboboxInput({ options, placeholder = "Select a option", onSelect, value, className }: ComboboxInputProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className={className}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? options.find((framework) => framework.value === value)?.label
                        : placeholder
                    }
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search..." className="h-9" />
                    <CommandList className="font-rubik-400 scroll-bar">
                        <CommandEmpty>Not found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.label.toLowerCase()}
                                    onSelect={() => {
                                        onSelect(framework.value) // still send the value like "1"
                                        setOpen(false)
                                    }}
                                >
                                    {framework.label} 
                                    {framework.badge && <Badge className="rounded-full ml-auto font-rubik-400 border-none bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400 min-w-fit"> {framework.badge} </Badge>}
                                    <Check
                                        className={cn(
                                            value === framework.value ? "opacity-100" : "opacity-0",
                                            !framework.badge && 'ml-auto'
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
