import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

export const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export type FormItemContextValue = {
  id: string;
};

export const FormItemContext = React.createContext<FormItemContextValue | null>(null);

export type FormFieldHookReturn = {
  id: string;
  name: FieldPath<FieldValues>;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  error?: { message?: string } | undefined;
  isTouched: boolean;
  isDirty: boolean;
  invalid: boolean;
};

export const useFormField = (): FormFieldHookReturn => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  // Provide a safe fallback when item context is missing (e.g., during tests)
  if (!itemContext) {
    return {
      id: "",
      name: fieldContext.name as FieldPath<FieldValues>,
      formItemId: `-form-item`,
      formDescriptionId: `-form-item-description`,
      formMessageId: `-form-item-message`,
      error: undefined,
      isTouched: false,
      isDirty: false,
      invalid: false,
    } as FormFieldHookReturn;
  }

  const { id } = itemContext;

  // getFieldState returns partial field metadata; map it into a stable shape
  const rawState = getFieldState(fieldContext.name as FieldPath<FieldValues>, formState);

  type SafeFieldState = {
    error?: { message?: string } | undefined;
    isTouched: boolean;
    isDirty: boolean;
    invalid: boolean;
  };

  const mappedState: SafeFieldState = {
    error: rawState?.error ?? undefined,
    isTouched: !!rawState?.isTouched,
    isDirty: !!rawState?.isDirty,
    invalid: !!rawState?.invalid,
  };

  return {
    id,
    name: fieldContext.name as FieldPath<FieldValues>,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...mappedState,
  } as FormFieldHookReturn;
};

// Contexts are exported inline where they are declared.
