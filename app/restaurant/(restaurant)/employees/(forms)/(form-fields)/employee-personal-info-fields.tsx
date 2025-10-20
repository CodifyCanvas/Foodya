import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useHookFormMask } from "use-mask-input";

/* === Props Interface === */
interface EmployeePersonalInfoProps {
  image?: string | null | undefined;
  previewUrl?: string | null;
  control: any;
  registerWithMask: ReturnType<typeof useHookFormMask>;
  mode?: 'create' | 'edit';
}

/* === Employee Personal Info Fields Component === */
export function EmployeePersonalInfo({ image, previewUrl, control, registerWithMask, mode = 'edit' }: EmployeePersonalInfoProps) {

  // === Field Prefix for Nested Forms ===
  const fieldPrefix = mode === 'edit' ? '' : 'personalInfo.'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  px-1 items-center gap-2 py-2">

      {/* === Employee Image Field === */}
      <div className="col-span-full md:col-span-1 md:row-span-3 lg:row-span-3 row-span-2 flex flex-col items-center justify-center">
        <div className="flex justify-start">
          {previewUrl ? (
            <div className="relative w-40 h-40 rounded-lg outline outline-gray-300 dark:outline-gray-600 overflow-hidden">
              <Image src={previewUrl} alt="New preview" fill style={{ objectFit: "cover" }} priority />
            </div>
          ) : image ? (
            <div className="relative w-40 h-40 rounded-lg outline outline-gray-300 dark:outline-gray-600 overflow-hidden">
              <Image src={image} alt="Current profile" fill style={{ objectFit: "cover" }} priority />
            </div>
          ) : (
            <div className="w-40 h-40 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600">
              No Image
            </div>
          )}
        </div>

        {/* === Image Upload Field === */}
        <div className="w-full py-2">
          <FormField
            control={control}
            name={`${fieldPrefix}image`}
            render={({ field }) => (
              <FormItem className="group relative w-auto sm:max-w-sm m-1">
                <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                  Image
                </FormLabel>
                <FormControl>
                  <input
                    type="file"
                    accept="image/*"
                    id="image-select-field"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      field.onChange(file);
                    }}
                    className="cursor-pointer text-neutral-700 h-10 w-full bg-white/5 backdrop-blur-xl rounded-lg content-center px-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* === Employee Name Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}name`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Employee Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="h-10 w-full"
                  placeholder="John Doe"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee CNIC Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}CNIC`}
          render={() => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Employee CNIC
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...registerWithMask(`${fieldPrefix}CNIC`, '99999-9999999-9')}
                  className="h-10 w-full"
                  placeholder="XXXXX-XXXXXXX-X"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Father Name Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}fatherName`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Father Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="h-10 w-full"
                  placeholder="David Malan"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Email Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}email`}
          render={({ field }) => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Employee Email
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="h-10 w-full"
                  placeholder="john.doe@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* === Employee Phone Field === */}
      <div className="w-full py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}phone`}
          render={() => (
            <FormItem className="group relative w-full m-1">
              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Employee Phone
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...registerWithMask(`${fieldPrefix}phone`, '9999-9999999')}
                  className="h-10 w-full"
                  placeholder="03XX-XXXXXXX"
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
