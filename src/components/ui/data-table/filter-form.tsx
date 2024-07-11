import React from "react";
import { Button } from "../button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";

export function DataFilterForm({
  onSubmit,
  onReset,
  fieldsConfig,
  isFiltered,
  values,
}: Props) {
  const [rawSchemaObj, defaultValues] = React.useMemo(
    () =>
      Object.entries(fieldsConfig).reduce(
        (prev, [field, conf]) => [
          { ...prev[0], [field]: conf.validation },
          { ...prev[1], [field]: conf.defaultValue },
        ],
        [{}, {}]
      ),
    [fieldsConfig]
  );

  const filterForm = useForm<z.infer<z.ZodObject<any, any, any>>>({
    resolver: zodResolver(z.object(rawSchemaObj)),
    defaultValues,
    values,
  });

  const resetHandler = React.useCallback(() => {
    onReset();
    filterForm.reset(defaultValues);
  }, [defaultValues, filterForm, onReset]);

  return (
    <Form {...filterForm}>
      <form onSubmit={filterForm.handleSubmit(onSubmit)} className="space-y-8">
        {Object.entries(fieldsConfig).map(([name, fieldConfig]) => (
          <FormField
            control={filterForm.control}
            key={name}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldConfig.label}</FormLabel>
                <FormControl>{fieldConfig.getFormElement(field)}</FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-between">
          <Button
            type="submit"
            variant="outline"
            disabled={!filterForm.formState.isDirty}
          >
            Apply
          </Button>

          <Button
            variant="secondary"
            disabled={!isFiltered}
            onClick={resetHandler}
          >
            Clear
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface Props {
  onSubmit: (values: Object) => void;
  onReset: () => void;
  fieldsConfig: DataTableFormConfig;
  isFiltered: boolean;
  values: { [k: string]: any };
}

export interface DataTableFormConfig {
  [key: string]: {
    validation: z.ZodType<any, any, any>;
    defaultValue: any;
    label: string;
    /**
     * Generates the form field for the given key in the filter form
     *
     * @param field - the field value from the FormField for the given key
     * @returns - the react element to render for this form
     */
    getFormElement: (field: DataTableFilterField) => React.ReactElement;
  };
}

export type DataTableFilterField = ControllerRenderProps<
  {
    [x: string]: any;
  },
  string
>;
