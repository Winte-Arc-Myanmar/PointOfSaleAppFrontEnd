"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUom } from "@/presentation/hooks/useUoms";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useUomClasses } from "@/presentation/hooks/useUomClasses";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  classId: z.string().min(1, "Class is required"),
  abbreviation: z.string().min(1, "Abbreviation is required"),
  conversionRateToBase: z.number().min(0, "Must be >= 0"),
});

export type UomFormData = z.infer<typeof schema>;

const defaultValues: UomFormData = {
  name: "",
  classId: "",
  abbreviation: "",
  conversionRateToBase: 1,
};

export interface CreateUomFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateUomForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateUomFormProps) {
  const createUom = useCreateUom();
  const toast = useToast();
  const { data: uomClasses = [], isLoading: isClassesLoading } = useUomClasses();

  useEffect(() => {
    onLoadingChange?.(createUom.isPending ?? false);
  }, [createUom.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UomFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data: UomFormData) => {
    createUom.mutate(
      {
        name: data.name,
        classId: data.classId,
        abbreviation: data.abbreviation,
        conversionRateToBase: data.conversionRateToBase,
      },
      {
        onSuccess: () => {
          toast.success("UOM created.");
          reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create UOM."),
      }
    );
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Kilogram" />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="classId">UOM Class</Label>
        <Controller
          control={control}
          name="classId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isClassesLoading}
            >
              <SelectTrigger id="classId">
                <SelectValue
                  placeholder={
                    isClassesLoading ? "Loading classes..." : "Select class"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {uomClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.classId && (
          <p className="text-sm text-red-600">{errors.classId.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="abbreviation">Abbreviation</Label>
        <Input
          id="abbreviation"
          {...register("abbreviation")}
          placeholder="e.g. kg"
        />
        {errors.abbreviation && (
          <p className="text-sm text-red-600">{errors.abbreviation.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="conversionRateToBase">Conversion rate to base</Label>
        <Input
          id="conversionRateToBase"
          type="number"
          step="any"
          {...register("conversionRateToBase", { valueAsNumber: true })}
        />
        {errors.conversionRateToBase && (
          <p className="text-sm text-red-600">
            {errors.conversionRateToBase.message}
          </p>
        )}
      </div>
      {createUom.isError && (
        <p className="text-sm text-red-600">
          Failed to create UOM. Please try again.
        </p>
      )}
      {!formId && (
        <Button type="submit" disabled={createUom.isPending}>
          {createUom.isPending ? "Creating..." : "Create UOM"}
        </Button>
      )}
    </form>
  );
}
