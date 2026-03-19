"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import FormField from "@/components/form/FormField";
import { locationData } from "@/lib/locationData";
import {
  buildTeamLeadSchema,
  type TeamLeadFormValues,
} from "@/features/teamleads/teamlead.schema";

interface ManagerOption {
  label: string;
  value: string;
}

interface TeamLeadFormProps {
  defaultValues?: Partial<TeamLeadFormValues>;
  disabled?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
  isManagerRole?: boolean;
  loadingManagers?: boolean;
  managerOptions?: ManagerOption[];
  onSubmit: (values: TeamLeadFormValues) => Promise<void> | void;
}

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getAdultCutoffDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setFullYear(d.getFullYear() - 18);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const EMPTY_VALUES: TeamLeadFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  username: "",
  password: "",
  managerId: "",
  dob: "",
  address: {
    houseNumber: "",
    street: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
  },
};

const normalizeMobile = (value: string) =>
  value.replace(/\D/g, "").slice(0, 10);
const normalizePincode = (value: string) =>
  value.replace(/\D/g, "").slice(0, 6);

const normalizeEmailInput = (rawValue: string) => {
  const sanitized = rawValue.replace(/\s/g, "");
  const match = sanitized.match(
    /^([^\s@]+@[^\s@]+\.(?:com|edu|org|net|gov|in|co\.in|io|biz|info))(?:.*)$/i,
  );
  return match ? match[1] : sanitized;
};

const ADULT_CUTOFF_DATE = getAdultCutoffDate();

export default function TeamLeadForm({
  defaultValues,
  disabled = false,
  submitLabel = "Submit",
  isEdit = false,
  isManagerRole = false,
  loadingManagers = false,
  managerOptions = [],
  onSubmit,
}: TeamLeadFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(
    () => buildTeamLeadSchema({ isEdit, isManagerRole }),
    [isEdit, isManagerRole],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TeamLeadFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      ...EMPTY_VALUES,
      ...defaultValues,
      address: {
        ...EMPTY_VALUES.address,
        ...(defaultValues?.address ?? {}),
      },
    },
  });

  const selectedCountry = watch("address.country");
  const selectedState = watch("address.state");
  const mobileValue = watch("mobileNumber");

  const countries = useMemo(
    () =>
      locationData.map((country) => ({
        label: country.name,
        value: country.name,
      })),
    [],
  );

  const states = useMemo(() => {
    const country = locationData.find((item) => item.name === selectedCountry);
    return (country?.states ?? []).map((state) => ({
      label: state.name,
      value: state.name,
    }));
  }, [selectedCountry]);

  const cities = useMemo(() => {
    const country = locationData.find((item) => item.name === selectedCountry);
    const state = country?.states.find((item) => item.name === selectedState);
    return (state?.cities ?? []).map((city) => ({ label: city, value: city }));
  }, [selectedCountry, selectedState]);

  const onValidSubmit = async (values: TeamLeadFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const onInvalidSubmit = () => {
    toast.error("Please fix the highlighted form errors");
  };

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="First Name"
          type="text"
          placeholder="Bob"
          register={register("firstName")}
          error={errors.firstName}
          disabled={disabled || isEdit}
        />
        <FormField
          label="Last Name"
          type="text"
          placeholder="Jones"
          register={register("lastName")}
          error={errors.lastName}
          disabled={disabled || isEdit}
        />
      </div>

      <FormField
        label="Username (optional)"
        type="text"
        placeholder="bob_jones"
        register={register("username")}
        error={errors.username}
        disabled={disabled}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Email"
          type="email"
          placeholder="bob@example.com"
          register={register("email", {
            onChange: (event) => {
              setValue("email", normalizeEmailInput(event.target.value), {
                shouldValidate: true,
              });
            },
          })}
          error={errors.email}
          disabled={disabled}
        />
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">
            Mobile (10 digits)
          </label>
          <div className="relative">
            {!isEdit && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                +91
              </span>
            )}
            <input
              type="text"
              value={mobileValue}
              onChange={(event) => {
                setValue("mobileNumber", normalizeMobile(event.target.value), {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              placeholder="9876543210"
              inputMode="numeric"
              maxLength={10}
              disabled={disabled || isEdit}
              className={`w-full rounded-md border py-2 pr-3 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                !isEdit ? "pl-10" : "px-3"
              } ${
                disabled || isEdit
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-white"
              } ${errors.mobileNumber ? "border-red-500" : "border-gray-300"}`}
            />
          </div>
          {errors.mobileNumber?.message && (
            <p className="text-xs text-red-600">
              {errors.mobileNumber.message}
            </p>
          )}
        </div>
      </div>

      {!isEdit && (
        <FormField
          label="Password"
          type="password"
          placeholder="Minimum 6 characters"
          register={register("password")}
          error={errors.password}
          disabled={disabled}
        />
      )}

      <FormField
        label="Date of Birth"
        type="date"
        register={register("dob", {
          onChange: (event) => {
            const selected = event.target.value;
            if (selected && selected > ADULT_CUTOFF_DATE) {
              setValue("dob", ADULT_CUTOFF_DATE, { shouldValidate: true });
            }
          },
        })}
        error={errors.dob}
        disabled={disabled || isEdit}
        min="1920-01-01"
        max={ADULT_CUTOFF_DATE || getToday()}
      />

      {!isManagerRole ? (
        <FormField
          label="Manager"
          type="select"
          placeholder={loadingManagers ? "Loading..." : "Select a manager"}
          options={managerOptions}
          register={register("managerId")}
          error={errors.managerId}
          disabled={disabled || loadingManagers}
        />
      ) : (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm font-medium text-blue-800">
            You are automatically assigned as manager.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="House Number"
          type="text"
          placeholder="42"
          register={register("address.houseNumber")}
          error={errors.address?.houseNumber}
          disabled={disabled}
        />
        <FormField
          label="Street"
          type="text"
          placeholder="Baker Street"
          register={register("address.street")}
          error={errors.address?.street}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField
          label="Country"
          type="select"
          placeholder="Select Country"
          options={countries}
          register={register("address.country", {
            onChange: () => {
              setValue("address.state", "", { shouldValidate: true });
              setValue("address.city", "", { shouldValidate: true });
            },
          })}
          error={errors.address?.country}
          disabled={disabled}
        />
        <FormField
          label="State"
          type="select"
          placeholder={
            selectedCountry ? "Select State" : "Select Country First"
          }
          options={states}
          register={register("address.state", {
            onChange: () => {
              setValue("address.city", "", { shouldValidate: true });
            },
          })}
          error={errors.address?.state}
          disabled={disabled || !selectedCountry}
        />
        <FormField
          label="City"
          type="select"
          placeholder={selectedState ? "Select City" : "Select State First"}
          options={cities}
          register={register("address.city")}
          error={errors.address?.city}
          disabled={disabled || !selectedState}
        />
      </div>

      <FormField
        label="Pincode"
        type="number"
        placeholder="400001"
        register={register("address.pincode", {
          onChange: (event) => {
            setValue("address.pincode", normalizePincode(event.target.value), {
              shouldValidate: true,
            });
          },
        })}
        error={errors.address?.pincode}
        disabled={disabled}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled || submitting}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
