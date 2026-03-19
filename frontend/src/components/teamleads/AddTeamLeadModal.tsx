"use client";

import { type CreateUserPayload, type User } from "@/types/user";
import FeatureAddTeamLeadModal from "@/features/teamleads/AddTeamLeadModal";
import { type TeamLeadFormValues } from "@/features/teamleads/teamlead.schema";

interface AddTeamLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateUserPayload, "role">) => void | Promise<void>;
  editUser?: User | null;
}

const toDefaultValues = (
  editUser?: User | null,
): Partial<TeamLeadFormValues> | undefined => {
  if (!editUser) return undefined;

  return {
    firstName: editUser.firstName ?? editUser.fname ?? "",
    lastName: editUser.lastName ?? editUser.lname ?? "",
    email: editUser.email ?? "",
    username: editUser.username ?? "",
    managerId: editUser.managerId ?? "",
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

export default function AddTeamLeadModal({
  isOpen,
  onClose,
  onSubmit,
  editUser,
}: AddTeamLeadModalProps) {
  const handleSubmit = async (values: TeamLeadFormValues) => {
    await onSubmit({
      ...values,
      username: values.username ?? editUser?.username ?? "",
      password: values.password ?? "",
      managerId: values.managerId ?? editUser?.managerId ?? "",
    });
  };

  return (
    <FeatureAddTeamLeadModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      defaultValues={toDefaultValues(editUser)}
      title={editUser ? "Edit Team Lead" : "Add Team Lead"}
      isEdit={!!editUser}
      submitLabel={editUser ? "Save Changes" : "Create Team Lead"}
    />
  );
}
