import { ImagePicker } from "@/components/custom/inputs/image-picker";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useHookFormMask } from "use-mask-input";

/* === Props Interface === */
interface EmployeePersonalInfoProps {
  image?: string | null | undefined;
  control: any;
  registerWithMask: ReturnType<typeof useHookFormMask>;
  mode?: 'create' | 'edit';
}

/* === Employee Personal Info Fields Component === */
export function EmployeePersonalInfo({ image, control, registerWithMask, mode = 'edit' }: EmployeePersonalInfoProps) {

  // === Field Prefix for Nested Forms ===
  const fieldPrefix = mode === 'edit' ? '' : 'personalInfo.'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[15rem_1fr]  px-1 items-center gap-2 py-2">

      {/* === Item Image Field === */}
      <div className="w-full justify-center flex py-2">
        <FormField
          control={control}
          name={`${fieldPrefix}image`}
          render={() => (
            <FormItem className="group relative w-auto sm:max-w-sm m-1">
              <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                Item Image
              </FormLabel>
              <FormControl>
                <ImagePicker
                  control={control}
                  name={`${fieldPrefix}image`}
                  allowedTypes={["png", "jpg", "jpeg", "webp"]}
                  currentImageUrl={image ?? undefined} // <- optional existing image
                  className="rounded-lg size-30 sm:size-40"
                  imageClassName="rounded-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full">

        {/* === Employee Name Field === */}
        <div className="w-full py-2">
          <FormField
            control={control}
            name={`${fieldPrefix}name`}
            render={({ field }) => (
              <FormItem className="group relative w-full m-1">
                <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
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
                <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
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
                <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
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
                <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
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
                <FormLabel className="bg-card text-muted-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
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

    </div>
  );
}
