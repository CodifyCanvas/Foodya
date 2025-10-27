import { MoveRight } from "lucide-react";
import React from "react";

interface StepperProps {
  currentStep: number;
  steps: string[];
}



/**
 * === Stepper ===
 * 
 * A horizontal stepper showing progress through multiple steps.
 * Highlights the current step, marks completed steps, and displays arrows between steps.
 *
 * @param currentStep - Active step (1-based index).
 * @param steps - Array of step labels.
 * @returns {JSX.Element} A styled horizontal stepper with step numbers and labels.
 *
 * @example
 * <Stepper
 *   currentStep={2}
 *   steps={['Login', 'Shipping', 'Payment', 'Review']}
 * />
 */
export default function Stepper({ currentStep, steps }: StepperProps): React.JSX.Element {
  return (
    <div className="flex items-center space-x-4">
      {steps.map((stepLabel, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={stepLabel}>
            <div className="flex flex-col px-2 items-center">
              <div
                className={`
                  w-8 h-8 flex items-center border-2 justify-center font-semibold rounded-full
                  ${isActive ? "border-black text-black" : isCompleted ? "bg-black border-black text-white" : " border-neutral-500/75 text-neutral-500"}
                `}
              >
                {stepNumber < 10 ? `0${stepNumber}` : stepNumber}
              </div>
              <p className={`mt-2 w-full text-center text-xs font-semibold ${isActive ? "text-black" : "text-neutral-500"}`}>
                {stepLabel}
              </p>
            </div>

            {/* Render arrow except after the last step */}
            {stepNumber !== steps.length && (
              <div className="text-gray-400 font-bold select-none"><MoveRight /></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}