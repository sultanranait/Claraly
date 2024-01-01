import React from "react";
import {
  useForm,
  UseFormReturn,
  FieldValues,
  Resolver,
  DefaultValues,
  SubmitHandler,
} from "react-hook-form";

export default function Form<FormValues extends FieldValues>({
  defaultValues,
  children,
  onSubmit,
  resolver,
}: {
  children: (methods: UseFormReturn<FormValues>) => React.ReactNode;
  onSubmit: SubmitHandler<FormValues>;
  defaultValues?: DefaultValues<FormValues>;
  resolver: Resolver<FormValues>;
}) {
  const methods = useForm<FormValues>({ defaultValues, resolver });
  const { handleSubmit } = methods;

  return (
    <form id="hook-form" onSubmit={handleSubmit(onSubmit)}>
      {children(methods)}
    </form>
  );
}
