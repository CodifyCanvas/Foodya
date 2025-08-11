import React, { useState, useEffect } from "react";

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

const ModernRadioButton: React.FC<ModernRadioButtonProps> = ({
  options,
  value: controlledValue,
  onValueChange,
  defaultFirst = false,
}) => {
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
            <span className="text-orange-600">{option.price}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ModernRadioButton;
