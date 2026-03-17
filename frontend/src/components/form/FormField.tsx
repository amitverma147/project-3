"use client";

import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";

type FieldType = "text" | "email" | "password" | "number" | "date" | "select";

type SelectOption = {
  label: string;
  value: string;
};

interface FormFieldProps {
  label: string;
  type: FieldType;
  register: UseFormRegisterReturn;
  error?: FieldError;
  placeholder?: string;
  options?: SelectOption[];
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
}

export default function FormField({
  label,
  type,
  register,
  error,
  placeholder,
  options = [],
  disabled = false,
  min,
  max,
}: FormFieldProps) {
  const baseClass = `w-full rounded-md border px-3 py-2 text-sm shadow-sm transition
    focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black
    ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}
    ${error ? "border-red-500" : "border-gray-300"}`;

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">{label}</label>

      {type === "select" ? (
        <select {...register} disabled={disabled} className={baseClass}>
          <option value="">{placeholder ?? `Select ${label}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...register}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          className={baseClass}
        />
      )}

      {error?.message && (
        <p className="text-xs text-red-600">{error.message}</p>
      )}
    </div>
  );
}
