import React, { useState } from "react";

type Option = {
  value: string;
  label: string;
  price: number;
};

interface ModernRadioButtonProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  defaultFirst?: boolean;
}



/**
 * === ModernRadioButton ===
 * 
 * A customizable radio button component that displays a list of options with labels and prices.
 * Supports both controlled and uncontrolled modes, and allows toggling selection by clicking
 * an already selected option to deselect it.
 * 
 * Features:
 * - Optional automatic selection of the first option (`defaultFirst`).
 * - Displays a price next to each label.
 * - Works in controlled (via `value` prop) or uncontrolled mode (internal state).
 * - Click-to-toggle behavior for the selected option.
 *
 * @param options - Array of option objects containing `value`, `label`, and `price`.
 * @param value - Controlled selected value (optional).
 * @param onValueChange - Callback fired when the selected value changes.
 * @param defaultFirst - Automatically select the first option if true (default: false).
 * @returns {JSX.Element} A styled list of selectable options with labels and prices.
 *
 * @example
 * <ModernRadioButton
 *   options={[
 *     { value: 'small', label: 'Small', price: 5 },
 *     { value: 'medium', label: 'Medium', price: 10 }
 *   ]}
 *   value={selectedValue}
 *   onValueChange={(val) => setSelectedValue(val)}
 *   defaultFirst={true}
 * />
 */
const ModernRadioButton: React.FC<ModernRadioButtonProps> = ({
  options,
  value: controlledValue,
  onValueChange,
  defaultFirst = false,
}) => {

  // === Local States ===
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultFirst ? options[0]?.value : undefined
  );

  const selectedValue = isControlled ? controlledValue : internalValue;

  const handleClick = (optionValue: string) => {
    const newValue = optionValue === selectedValue ? undefined : optionValue;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onValueChange?.(newValue);
  };

  return (
    <div className="max-w-sm w-full flex flex-col">
      {options.map((option) => {
        const isSelected = selectedValue === option.value;

        return (
          <div
            key={option.value}
            onClick={() => handleClick(option.value)}
            className={`cursor-pointer min-w-16 py-1 px-2 rounded flex justify-between items-center capitalize text-start text-xs
              ${isSelected ? "border-2 border-emerald-600" : "border-none"}
            `}
          >
            {option.label}
            &nbsp;
            <span className="text-orange-600 dark:text-orange-400">{option.price}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ModernRadioButton;