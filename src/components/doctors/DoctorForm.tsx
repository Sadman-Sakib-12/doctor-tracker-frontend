"use client";
import { useForm } from "react-hook-form";
import { Doctor } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type DoctorFormData = Omit<Doctor, "_id" | "createdAt" | "updatedAt">;

interface DoctorFormProps {
  defaultValues?: Partial<DoctorFormData>;
  onSubmit: (data: DoctorFormData) => Promise<void>;
  loading?: boolean;
}

export default function DoctorForm({ defaultValues, onSubmit, loading }: DoctorFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<DoctorFormData>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Name" error={errors.name?.message}
          {...register("name", { required: "Name is required" })} />
        <Input label="Specialization" error={errors.specialization?.message}
          {...register("specialization", { required: "Specialization is required" })} />
        <Input label="Hospital" error={errors.hospital?.message}
          {...register("hospital", { required: "Hospital is required" })} />
        <Input label="Phone" error={errors.phone?.message}
          {...register("phone", { required: "Phone is required" })} />
        <Input label="Email" type="email" error={errors.email?.message}
          className="sm:col-span-2"
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
          })} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>Save Doctor</Button>
      </div>
    </form>
  );
}
