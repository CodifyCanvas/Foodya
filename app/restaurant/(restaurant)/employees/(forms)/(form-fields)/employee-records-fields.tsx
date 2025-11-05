import { DateInput } from "@/components/custom/date-picker";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SelectInput from "@/components/ui/select-input";

/* === Props Interface === */
interface EmployeeRecordsInfoProps {
  control: any;
  mode?: 'create' | 'edit';
}

/* === Employee Record Info Fields Component === */
export function EmployeeRecords({ control, mode = 'edit' }: EmployeeRecordsInfoProps) {

  // === Field Prefix for Nested Forms ===
  const fieldPrefix = mode === 'edit' ? '' : 'employmentRecord.'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-1 items-center gap-2 py-2">

      {/* === Employee Designation Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}designation`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Employee Designation
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="h-10 w-full"
                  placeholder="Software Engineer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Shift Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}shift`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Employee Shift
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="h-10 w-full"
                  placeholder="Morning Shift"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Joining Date Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}joinedAt`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Joined Date
              </FormLabel>
              <FormControl>
                <DateInput {...field} className="w-full" return="string" now={true} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Resigned Date (if any) Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}resignedAt`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Resigned Date (if any)
              </FormLabel>
              <FormControl>
                <DateInput {...field} className="w-full" return="string" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Status Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}status`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Employeement Status
              </FormLabel>
              <FormControl>
                <SelectInput options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Resigned', value: 'resigned' },
                  { label: 'Terminated', value: 'terminated' },
                  { label: 'Rejoined', value: 'rejoined' },
                ]}
                  value={field.value}
                  className="w-full rounded-lg"
                  onChange={field.onChange}
                  placeholder="Active, Resigned, Terminated..."
                  id="select_changeType_empolyee_salary_info_form"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Record Change Type Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}changeType`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel htmlFor="select_changeType_empolyee_records_form" className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Change Type
              </FormLabel>
              <FormControl>
                <SelectInput options={[
                  { label: 'Valid', value: 'valid' },
                  { label: 'Correction', value: 'correction', optDisabled: mode === 'create' },
                ]}
                  value={field.value}
                  className="w-full rounded-lg"
                  onChange={field.onChange}
                  placeholder="Valid, Correction..."
                  id="select_changeType_empolyee_records_form"
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
