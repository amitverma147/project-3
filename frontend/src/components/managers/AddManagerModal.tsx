"use client";

import { useState, useEffect, type InputHTMLAttributes } from "react";
import { CreateUserPayload, User } from "@/types/user";
import { locationData } from "@/lib/locationData";

interface AddManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateUserPayload, "role">) => void;
  editUser?: User | null;
}

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  dob: string;
  username: string;
  address: {
    houseNumber: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
};

const EMPTY: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  mobileNumber: "",
  dob: "",
  username: "",
  address: {
    houseNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  },
};

const toLocalDateInputValue = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const maxAdultDob = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setFullYear(d.getFullYear() - 18);
  return toLocalDateInputValue(d);
})();

export default function AddManagerModal({
  isOpen,
  onClose,
  onSubmit,
  editUser,
}: AddManagerModalProps) {
  const isEdit = !!editUser;
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Available options based on selection
  const [availableStates, setAvailableStates] = useState<
    { name: string; code: string; cities: string[] }[]
  >([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        const phone = editUser.mobileNumber ?? "";
        // Remove +91 if present for display
        const displayPhone = phone.startsWith("+91") ? phone.slice(3) : phone;

        setForm({
          firstName: editUser.firstName ?? "",
          lastName: editUser.lastName ?? "",
          email: editUser.email ?? "",
          password: "",
          mobileNumber: displayPhone,
          dob: editUser.dob ? editUser.dob.slice(0, 10) : "",
          username: editUser.username ?? "",
          address: {
            houseNumber: editUser.address?.houseNumber ?? "",
            street: editUser.address?.street ?? "",
            city: editUser.address?.city ?? "",
            state: editUser.address?.state ?? "",
            pincode: editUser.address?.pincode ?? "",
            country: editUser.address?.country ?? "",
          },
        });

        // Set available options based on existing data
        const country = locationData.find(
          (c) => c.name === editUser.address?.country,
        );
        if (country) {
          setAvailableStates(country.states);
          const state = country.states.find(
            (s) => s.name === editUser.address?.state,
          );
          if (state) {
            setAvailableCities(state.cities);
          }
        }
      } else {
        setForm(EMPTY);
        setAvailableStates([]);
        setAvailableCities([]);
      }
      setErrors({});
    }
  }, [isOpen, editUser]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getDobError = (dob: string): string | undefined => {
    if (!dob) return "Required";

    const selectedDate = new Date(`${dob}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime())) return "Invalid date";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) return "DOB cannot be in the future";

    const adultCutoff = new Date(today);
    adultCutoff.setFullYear(adultCutoff.getFullYear() - 18);

    return selectedDate <= adultCutoff
      ? undefined
      : "Age must be at least 18 years";
  };

  const validateDynamicField = (
    field: string,
    nextForm: FormData,
  ): string | undefined => {
    switch (field) {
      case "firstName":
        return !isEdit && !nextForm.firstName.trim() ? "Required" : undefined;
      case "lastName":
        return !isEdit && !nextForm.lastName.trim() ? "Required" : undefined;
      case "email":
        if (!nextForm.email.trim()) return "Required";
        return /\S+@\S+\.\S+/.test(nextForm.email)
          ? undefined
          : "Invalid email";
      case "password":
        if (isEdit) return undefined;
        if (!nextForm.password) return "Required";
        return nextForm.password.length >= 6 ? undefined : "Min 6 characters";
      case "mobileNumber":
        if (isEdit) return undefined;
        if (!nextForm.mobileNumber.trim()) return "Required";
        return /^\d{10}$/.test(nextForm.mobileNumber)
          ? undefined
          : "Enter 10 digit mobile number";
      case "dob":
        return isEdit ? undefined : getDobError(nextForm.dob);
      case "address.houseNumber":
        return !nextForm.address.houseNumber.trim() ? "Required" : undefined;
      case "address.street":
        return !nextForm.address.street.trim() ? "Required" : undefined;
      case "address.country":
        return !nextForm.address.country.trim() ? "Required" : undefined;
      case "address.state":
        return !nextForm.address.state.trim() ? "Required" : undefined;
      case "address.city":
        return !nextForm.address.city.trim() ? "Required" : undefined;
      case "address.pincode":
        if (!nextForm.address.pincode.trim()) return "Required";
        return /^\d{6}$/.test(nextForm.address.pincode)
          ? undefined
          : "Enter 6 digit pincode";
      default:
        return undefined;
    }
  };

  const normalizeEmailInput = (rawValue: string): string => {
    const sanitized = rawValue.replace(/\s/g, "");
    const match = sanitized.match(
      /^([^\s@]+@[^\s@]+\.(?:com|edu|org|net|gov|in|co\.in|io|biz|info))(?:.*)$/i,
    );
    return match ? match[1] : sanitized;
  };

  const setField = (field: string, value: string) => {
    const normalizedValue =
      field === "mobileNumber"
        ? value.replace(/\D/g, "").slice(0, 10)
        : field === "email"
          ? normalizeEmailInput(value)
          : field === "address.pincode"
            ? value.replace(/\D/g, "").slice(0, 6)
            : field === "dob" && value > maxAdultDob
              ? maxAdultDob
              : value;

    let nextForm: FormData;

    if (field.startsWith("address.")) {
      const key = field.split(".")[1];

      // Handle cascading dropdowns
      if (key === "country") {
        const country = locationData.find((c) => c.name === normalizedValue);
        setAvailableStates(country?.states ?? []);
        setAvailableCities([]);
        nextForm = {
          ...form,
          address: {
            ...form.address,
            country: normalizedValue,
            state: "",
            city: "",
          },
        };
      } else if (key === "state") {
        const state = availableStates.find((s) => s.name === normalizedValue);
        setAvailableCities(state?.cities ?? []);
        nextForm = {
          ...form,
          address: {
            ...form.address,
            state: normalizedValue,
            city: "",
          },
        };
      } else {
        nextForm = {
          ...form,
          address: { ...form.address, [key]: normalizedValue },
        };
      }
    } else {
      nextForm = { ...form, [field]: normalizedValue };
    }

    setForm(nextForm);

    setErrors((prev) => {
      const e = { ...prev };
      const fieldsToRevalidate = [field];

      if (field === "address.country") {
        fieldsToRevalidate.push("address.state", "address.city");
      }
      if (field === "address.state") {
        fieldsToRevalidate.push("address.city");
      }

      for (const f of fieldsToRevalidate) {
        const msg = validateDynamicField(f, nextForm);
        if (msg) e[f] = msg;
        else delete e[f];
      }

      return e;
    });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!isEdit && !form.firstName.trim()) e.firstName = "Required";
    if (!isEdit && !form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!isEdit) {
      if (!form.password) e.password = "Required";
      else if (form.password.length < 6) e.password = "Min 6 characters";
    }
    if (!isEdit && !form.mobileNumber.trim()) e.mobileNumber = "Required";
    else if (!isEdit && !/^\d{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Enter 10 digit mobile number";
    if (!isEdit) {
      const dobError = getDobError(form.dob);
      if (dobError) e.dob = dobError;
    }
    if (!form.address.houseNumber.trim()) e["address.houseNumber"] = "Required";
    if (!form.address.street.trim()) e["address.street"] = "Required";
    if (!form.address.country.trim()) e["address.country"] = "Required";
    if (!form.address.state.trim()) e["address.state"] = "Required";
    if (!form.address.city.trim()) e["address.city"] = "Required";
    if (!form.address.pincode.trim()) e["address.pincode"] = "Required";
    else if (!/^\d{6}$/.test(form.address.pincode))
      e["address.pincode"] = "Enter 6 digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Add +91 prefix to mobile number before submitting
      const submitData = {
        ...form,
        mobileNumber: isEdit
          ? form.mobileNumber
          : form.mobileNumber.startsWith("+91")
            ? form.mobileNumber
            : `+91${form.mobileNumber}`,
      };
      await onSubmit(submitData);
    } finally {
      setSubmitting(false);
    }
  };

  const inp = (
    field: string,
    value: string,
    placeholder: string,
    type = "text",
    disabled = false,
    inputProps?: Pick<InputHTMLAttributes<HTMLInputElement>, "max" | "min">,
  ) => (
    <div>
      <input
        type={type}
        value={value}
        onChange={(ev) => setField(field, ev.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        {...inputProps}
        className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : errors[field]
              ? "border-red-500"
              : "border-gray-300"
        }`}
      />
      {disabled && (
        <p className="mt-1 text-xs text-gray-400">Cannot be changed</p>
      )}
      {!disabled && errors[field] && (
        <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
      )}
    </div>
  );

  const dropdown = (
    field: string,
    value: string,
    options: string[],
    placeholder: string,
    disabled = false,
  ) => (
    <div>
      <select
        value={value}
        onChange={(ev) => setField(field, ev.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
          errors[field]
            ? "border-red-500"
            : disabled
              ? "border-gray-200 bg-gray-100 text-gray-400"
              : "border-gray-300"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {errors[field] && (
        <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg relative z-10 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-medium text-gray-900">
            {isEdit ? "Edit Manager" : "Add Manager"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <form
          id="add-manager-form"
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4"
        >
          {/* Personal */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Personal Info
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name
              </label>
              {inp("firstName", form.firstName, "Alice", "text", isEdit)}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name
              </label>
              {inp("lastName", form.lastName, "Smith", "text", isEdit)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Username (optional)
            </label>
            {inp("username", form.username, "alice_smith")}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            {inp("email", form.email, "alice@example.com", "email")}
          </div>
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              {inp("password", form.password, "••••••••", "password")}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mobile (10 digits)
              </label>
              <div className="relative">
                {!isEdit && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    +91
                  </span>
                )}
                {isEdit ? (
                  inp(
                    "mobileNumber",
                    form.mobileNumber,
                    "+911234567890",
                    "text",
                    true,
                  )
                ) : (
                  <input
                    type="text"
                    value={form.mobileNumber}
                    onChange={(ev) => setField("mobileNumber", ev.target.value)}
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
                      errors.mobileNumber ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                )}
              </div>
              {!isEdit && errors.mobileNumber && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.mobileNumber}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              {inp("dob", form.dob, "", "date", isEdit, {
                max: maxAdultDob,
                min: "1920-01-01",
              })}
            </div>
          </div>

          {/* Address */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">
            Address
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                House No.
              </label>
              {inp("address.houseNumber", form.address.houseNumber, "42")}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Street
              </label>
              {inp("address.street", form.address.street, "Baker Street")}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Country
            </label>
            {dropdown(
              "address.country",
              form.address.country,
              locationData.map((c) => c.name),
              "Select Country",
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              State
            </label>
            {dropdown(
              "address.state",
              form.address.state,
              availableStates.map((s) => s.name),
              form.address.country ? "Select State" : "Select Country First",
              !form.address.country,
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              City
            </label>
            {dropdown(
              "address.city",
              form.address.city,
              availableCities,
              form.address.state ? "Select City" : "Select State First",
              !form.address.state,
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pincode
            </label>
            {inp("address.pincode", form.address.pincode, "400001")}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-manager-form"
            disabled={submitting}
            className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? "Save Changes"
                : "Create Manager"}
          </button>
        </div>
      </div>
    </div>
  );
}
