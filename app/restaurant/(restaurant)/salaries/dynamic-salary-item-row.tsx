import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export function DynamicSalaryItemRow({
  index,
  control,
  watch,
  setValue,
}: {
  index: number;
  control: any;
  watch: any;
  setValue: any;
}) {
  const basicPay = watch(`salaries.${index}.basicPay`);
  const bonus = watch(`salaries.${index}.bonus`);
  const penalty = watch(`salaries.${index}.penalty`) || 1;


  // Auto update Total when Bonus or Penalty changes
  useEffect(() => {
    const basic = Number(basicPay) || 0;
    const b = Number(bonus) || 0;
    const p = Number(penalty) || 0;

    const lineTotal = basic + b - p;

    // update the totalPay field
    setValue(`salaries.${index}.totalPay`, lineTotal.toString());
  }, [basicPay, bonus, penalty, index, setValue]);

  return (
    <>
      {/* === Basic Pay Input Field === */}
      <div className="w-full">
        <FormField
          control={control}
          name={`salaries.${index}.basicPay`}
          render={({ field }) => (
            <FormItem className="group relative w-auto sm:max-w-sm m-1">
              <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Basic Pay
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="XXXX"
                  {...field}
                  className="h-10"
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Bonus Input Field === */}
      <div className="w-full">
        <FormField
          control={control}
          name={`salaries.${index}.bonus`}
          render={({ field }) => (
            <FormItem className="group relative w-auto sm:max-w-sm m-1">
              <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Bonus
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="XXX"
                  {...field}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Penalty Input Field === */}
      <div className="w-full">
        <FormField
          control={control}
          name={`salaries.${index}.penalty`}
          render={({ field }) => (
            <FormItem className="group relative w-auto sm:max-w-sm m-1">
              <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Penalty
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="XXX"
                  {...field}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Decription Input Field === */}
      <div className="w-full">
        <FormField
          control={control}
          name={`salaries.${index}.description`}
          render={({ field }) => (
            <FormItem className="group relative w-auto sm:max-w-sm m-1">
              <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Description
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Optional"
                  {...field}
                  // value={field.value ?? ""}
                  // onChange={(e) => field.onChange(e.target.value)}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Total Pay Input Field === */}
      <div className="w-full">
        <FormField
          control={control}
          name={`salaries.${index}.totalPay`}
          render={({ field }) => (
            <FormItem className="group relative w-auto sm:max-w-sm m-1">
              <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Total Pay
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="XXXX"
                  {...field}
                  className="h-10"
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
