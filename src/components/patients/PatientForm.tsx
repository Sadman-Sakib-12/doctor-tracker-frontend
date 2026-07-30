"use client";
import { useForm } from "react-hook-form";
import { Patient, Doctor } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

type PatientFormData = Omit<Patient, "_id" | "createdAt" | "updatedAt">;

interface PatientFormProps {
  defaultValues?: Partial<PatientFormData>;
  doctors?: Doctor[];
  fixedDoctorId?: string;
  onSubmit: (data: PatientFormData) => Promise<void>;
  loading?: boolean;
}

const CONDITIONS = [
  { value: "stable", label: "Stable" },
  { value: "critical", label: "Critical" },
  { value: "recovering", label: "Recovering" },
  { value: "chronic", label: "Chronic" },
  { value: "discharged", label: "Discharged" },
  { value: "under observation", label: "Under Observation" },
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function PatientForm({ defaultValues, doctors, fixedDoctorId, onSubmit, loading }: PatientFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    defaultValues: { ...defaultValues, doctor: fixedDoctorId || (typeof defaultValues?.doctor === "string" ? defaultValues.doctor : (defaultValues?.doctor as Doctor)?._id) },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Name" error={errors.name?.message}
          {...register("name", { required: "Name is required" })} />
        <Input label="Age" type="number" error={errors.age?.message}
          {...register("age", { required: "Age is required", valueAsNumber: true, min: { value: 0, message: "Must be ≥ 0" } })} />
        <Select label="Gender" options={GENDERS} placeholder="Select gender" error={errors.gender?.message}
          {...register("gender", { required: "Gender is required" })} />
        <Select label="Condition" options={CONDITIONS} placeholder="Select condition" error={errors.condition?.message}
          {...register("condition", { required: "Condition is required" })} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Address" error={errors.address?.message} className="sm:col-span-2" {...register("address")} />

        {!fixedDoctorId && doctors && (
          <Select
            label="Doctor"
            options={doctors.map((d) => ({ value: d._id, label: `${d.name} – ${d.specialization}` }))}
            placeholder="Select doctor"
            className="sm:col-span-2"
            {...register("doctor", { required: "Doctor is required" })}
          />
        )}
        {fixedDoctorId && <input type="hidden" value={fixedDoctorId} {...register("doctor")} />}

        <textarea
          placeholder="Notes (optional)"
          rows={3}
          className="sm:col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("notes")}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>Save Patient</Button>
      </div>
    </form>
  );
}
