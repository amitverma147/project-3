"use client";

import { useEffect } from "react";
import ManagerForm from "@/features/managers/ManagerForm";
import { type ManagerFormValues } from "@/features/managers/manager.schema";

interface AddManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ManagerFormValues) => Promise<void> | void;
  defaultValues?: Partial<ManagerFormValues>;
  title?: string;
  isEdit?: boolean;
  submitLabel?: string;
}

const ensureMobileWithCountryCode = (mobileNumber: string) => {
  const normalized = mobileNumber.trim();
  return normalized.startsWith("+91") ? normalized : `+91${normalized}`;
};

export default function AddManagerModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  title = "Add Manager",
  isEdit = false,
  submitLabel,
}: AddManagerModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (values: ManagerFormValues) => {
    await onSubmit({
      ...values,
      mobileNumber: ensureMobileWithCountryCode(values.mobileNumber),
    });
  };

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
        aria-labelledby="manager-modal-title"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2
            id="manager-modal-title"
            className="text-lg font-medium text-gray-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <ManagerForm
            defaultValues={defaultValues}
            submitLabel={
              submitLabel ?? (isEdit ? "Save Changes" : "Create Manager")
            }
            isEdit={isEdit}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
