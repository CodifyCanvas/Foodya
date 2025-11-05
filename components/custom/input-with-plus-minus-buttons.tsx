'use client'

import { cn } from '@/lib/utils'
import { MinusIcon, PlusIcon } from 'lucide-react'

import { Button, Group, Input, NumberField } from 'react-aria-components'

type InputWithPlusMinusButtonsProps = {
  className?: string
  quantity: number
  onChange: (value: number) => void
}



/**
 * === Numeric input with increment and decrement buttons. ===
 * 
 * Renders a numeric input field with plus (+) and minus (−) buttons to adjust the value.
 * Ensures values are always numbers and supports minimum value enforcement.
 *
 * @param className - Optional additional class names for styling the container.
 * @param quantity - Current numeric value displayed in the input.
 * @param onChange - Callback fired whenever the value changes, passing the updated number.
 * @returns {JSX.Element} A number input with increment and decrement buttons.
 * 
 * @example
 * <InputWithPlusMinusButtons
 *    quantity={5}
 *    onChange={(val) => setQuantity(val)}
 *    className="my-custom-class"
 * />
 */
const InputWithPlusMinusButtons = ({
  className,
  quantity,
  onChange,
}: InputWithPlusMinusButtonsProps): React.JSX.Element => {

  return (
    <NumberField
      value={quantity}
      onChange={(value) => {
        const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0
        onChange(safeValue)
      }}
      minValue={0}
      className={cn('w-full max-w-xs space-y-2', className)}
      aria-label="Quantity"
    >
      <Group className='dark:bg-input/30 border-input data-focus-within:border-ring 
                        data-focus-within:ring-ring/50 
                        data-focus-within:has-aria-invalid:ring-destructive/20 
                        dark:data-focus-within:has-aria-invalid:ring-destructive/40 
                        data-focus-within:has-aria-invalid:border-destructive relative 
                        inline-flex h-9 w-full min-w-0 items-center overflow-hidden 
                        rounded-md border bg-transparent text-base whitespace-nowrap 
                        shadow-xs transition-[color,box-shadow] outline-none 
                        data-disabled:pointer-events-none data-disabled:cursor-not-allowed 
                        data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm'
      >

        {/* Decrement Button */}
        <Button
          aria-label="Decrement-Qty"
          slot='decrement'
          className='border-none bg-orange-500 text-white hover:bg-orange-600 
                     cursor-pointer ms-2 flex aspect-square h-5 items-center justify-center 
                     rounded-sm border text-sm transition-[color,box-shadow] 
                     disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          <MinusIcon className='size-3' />
          <span className='sr-only'>Decrement</span>
        </Button>

        {/* Numeric Input */}
        <Input className='w-full min-w-14 grow px-3 py-2 text-center tabular-nums outline-none' />

        {/* Increment Button */}
        <Button
          aria-label="Increment-Qty"
          slot='increment'
          className='border-none bg-orange-500 text-white hover:bg-orange-600 
                     cursor-pointer me-2 flex aspect-square h-5 items-center justify-center
                     rounded-sm border text-sm transition-[color,box-shadow] 
                     disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          <PlusIcon className='size-3' />
          <span className='sr-only'>Increment</span>
        </Button>
      </Group>
    </NumberField>
  )
}

export default InputWithPlusMinusButtons