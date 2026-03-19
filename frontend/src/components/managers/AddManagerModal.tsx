"use client";

import { type CreateUserPayload, type User } from "@/types/user";
import FeatureAddManagerModal from "@/features/managers/AddManagerModal";
import { type ManagerFormValues } from "@/features/managers/manager.schema";

interface AddManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateUserPayload, "role">) => void | Promise<void>;
  editUser?: User | null;
}

const toDefaultValues = (
  editUser?: User | null,
): Partial<ManagerFormValues> | undefined => {
  if (!editUser) return undefined;

  return {
    firstName: editUser.firstName ?? editUser.fname ?? "",
    lastName: editUser.lastName ?? editUser.lname ?? "",
    email: editUser.email ?? "",
    username: editUser.username ?? "",
    mobileNumber: (editUser.mobileNumber ?? "").replace(/^\+91/, ""),
    dob: editUser.dob ? editUser.dob.slice(0, 10) : "",
    address: {
      houseNumber: editUser.address?.houseNumber ?? "",
      street: editUser.address?.street ?? "",
      country: editUser.address?.country ?? "",
      state: editUser.address?.state ?? "",
      city: editUser.address?.city ?? "",
      pincode: editUser.address?.pincode ?? "",
    },
  };
};

export default function AddManagerModal({
  isOpen,
  onClose,
  onSubmit,
  editUser,
}: AddManagerModalProps) {
  const handleSubmit = async (values: ManagerFormValues) => {
    await onSubmit({
      ...values,
      username: values.username ?? editUser?.username ?? "",
      password: values.password ?? "",
    });
  };

  return (
    <FeatureAddManagerModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      defaultValues={toDefaultValues(editUser)}
      title={editUser ? "Edit Manager" : "Add Manager"}
      isEdit={!!editUser}
      submitLabel={editUser ? "Save Changes" : "Create Manager"}
    />
  );
}
