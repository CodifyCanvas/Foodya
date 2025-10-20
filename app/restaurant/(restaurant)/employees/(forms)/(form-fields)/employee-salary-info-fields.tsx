import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SelectInput from "@/components/ui/select-input";

/* === Props Interface === */
interface EmployeeSalaryInfoProps {
  control: any;
  mode?: 'create' | 'edit';
}

/* === Employee Salary Changes Fields Component === */
export function EmployeeSalaryInfo({ control, mode = 'edit' }: EmployeeSalaryInfoProps) {

  // === Field Prefix for Nested Forms ===
  const fieldPrefix = mode === 'edit' ? '' : 'salaryChanges.'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-1 items-center gap-2 py-2">

      {/* === Employee Previous Salary Field === */}
      <div className="w-full py-2" hidden={mode === 'create'}>
        <FormField
          control={control}
          name={`${fieldPrefix}previousSalary`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Current Salary
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ''}
                  className="h-10 w-full"
                  readOnly
                  placeholder="XXXX"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee New Salary Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}newSalary`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                New Salary
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="h-10 w-full"
                  placeholder="XXXX"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Salary Change Reason Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}reason`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Reason
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="h-10 w-full"
                  placeholder="Annual increment"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Salary Change Type Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}changeType`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel htmlFor="select_changeType_empolyee_salary_info_form" className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Change Type
              </FormLabel>
              <FormControl>
                <SelectInput options={[
                  { label: 'Initial', value: 'initial' },
                  { label: 'Raise', value: 'raise' },
                  { label: 'Promotion', value: 'promotion' },
                  { label: 'Adjustment', value: 'adjustment' },
                  { label: 'Correction', value: 'correction', optDisabled: mode === 'create' },
                ]}
                  value={field.value}
                  className="w-full rounded-lg"
                  onChange={field.onChange}
                  placeholder="Initial, Raise, Prom..."
                  id="select_changeType_empolyee_salary_info_form"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>


    </div>
  );
}
