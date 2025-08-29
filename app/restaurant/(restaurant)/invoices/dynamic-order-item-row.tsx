import { Button } from "@/components/ui/button";
import { ComboboxInput } from "@/components/ui/combobox-input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectInput from "@/components/ui/select-input";
import { ItemWithOptions, MenuItemOptions } from "@/lib/definations";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";

export function DynamicOrderItemRow({
  index,
  control,
  menuItems,
  remove,
  watch,
  setValue,
}: {
  index: number;
  control: any;
  menuItems: any[];
  remove: (index: number) => void;
  watch: any;
  setValue: any;
}) {
  const menuItemId = watch(`orderItems.${index}.menuItemId`);
  const optionId = watch(`orderItems.${index}.menuItemOptionId`);
  const quantity = watch(`orderItems.${index}.quantity`) || 1;
  const price = watch(`orderItems.${index}.price`) || 0;

  const selectedMenuItem = menuItems.find((m) => m.id.toString() === menuItemId);
  const options = selectedMenuItem?.options ?? [];
  const selectedOption = options.find((opt: MenuItemOptions) => opt.option_id.toString() === optionId);

  const lineTotal = quantity * price;

  // Auto update price when menuItem or option changes
  useEffect(() => {
    if (selectedOption) {
      setValue(`orderItems.${index}.price`, parseFloat(selectedOption.price));
    } else if (selectedMenuItem) {
      setValue(`orderItems.${index}.price`, parseFloat(selectedMenuItem.price));
    }

    // Set menuItemName when menuItem is selected
  if (selectedMenuItem) {
    setValue(`orderItems.${index}.menuItemName`, selectedMenuItem.item);
  }
    
  // Set Menu item image when menuItem is selected
  if (selectedMenuItem) {
    setValue(`orderItems.${index}.menuItemImage`, selectedMenuItem.image);
  }

  // Set optionName if selectedOption exists, otherwise set to empty string
  setValue(
    `orderItems.${index}.menuItemOptionName`,
   selectedOption?.option_name?.trim() ? selectedOption.option_name : null
    // selectedOption?.option_name || null
  );

  }, [menuItemId, optionId]);

  return (
    <div className="grid grid-cols-[minmax(13rem,18rem)_minmax(8rem,15rem)_6rem_6rem_6rem_auto] items-center gap-2 py-2">
      
      {/* === Menu Item Input Field === */}
      <div className="w-full">
        <FormField
          control={control}
          name={`orderItems.${index}.menuItemId`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                <span className="hidden sm:block">Select Menu Item</span>
  <span className="block sm:hidden">Item</span>
              </FormLabel>
              <FormControl>
                <ComboboxInput
                  options={menuItems.map((item : ItemWithOptions) => ({
                    value: String(item.id),
                    label: item.item,
                  }))}
                  value={field.value}
                  onSelect={field.onChange}
                  className="w-full rounded-lg truncate"
                  placeholder="Select Item"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Menu Item Option Input Field === */}
      <div className="w-full">
        <FormField
          control={control}
          name={`orderItems.${index}.menuItemOptionId`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                <span className="hidden sm:block">Select Item Option</span>
  <span className="block sm:hidden">Option</span>
              </FormLabel>
              <FormControl>
                <SelectInput
                  options={options.map((opt: MenuItemOptions) => ({
                    value: opt.option_id ? String(opt.option_id) : "",
                    label: opt.option_name,
                  }))}
                  disabled={options.length === 0}
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full rounded-lg"
                  placeholder="Select option"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Quantity Input Field === */}
      <div className="w-full">
        <FormField
          control={control}
          name={`orderItems.${index}.quantity`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                <span className="hidden sm:block">Quantity</span>
  <span className="block sm:hidden">Qty</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="h-10 w-full"
                  step={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Price Input Field === */}
      <div className="w-full">
        <FormField
          control={control}
          name={`orderItems.${index}.price`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Price
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="h-10 w-full"
                  step="any"
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Total (Qty * Price) - Temporary Display === */}
      <div className="w-full group relative h-10 p-2 m-1 border rounded-lg text-center">
        <Label className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
          Total
        </Label>
        <div className="px-2 text-sm font-rubik-400 text-end h-10">{lineTotal.toFixed(2)}</div>
      </div>

      {/* === Remove Dynamic Row Button === */}
      <Button
        type="button"
        size="icon"
        variant="destructive"
        onClick={() => remove(index)}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
