import * as React from "react";
import { Controller, ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { FormFieldContext } from "./formContext";

// FormField is a small wrapper that provides the field name via context
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name as TName }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export default FormField;
