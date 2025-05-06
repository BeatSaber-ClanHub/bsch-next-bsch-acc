"use client";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { Button } from "../ui/button";
import { FormControl } from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface DatePickerProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
}

const DatePicker = <TFieldValues extends FieldValues>({
  field,
  disabled,
}: DatePickerProps<TFieldValues> & { disabled?: boolean }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            disabled={disabled}
            variant={"outline"}
            className={cn(
              "w-full sm:w-[240px] pl-3 text-left font-normal",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value ? (
              format(field.value, "MM/dd/yyyy")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value || undefined}
          onSelect={field.onChange}
          disabled={(date: Date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return date < today || date < new Date("1900-01-01");
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
