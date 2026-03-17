"use client";

import { type CreateUserPayload, type User } from "@/types/user";
import FeatureAddEmployeeModal from "@/features/employees/AddEmployeeModal";
import { type EmployeeFormValues } from "@/features/employees/employee.schema";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateUserPayload, "role">) => void | Promise<void>;
  editUser?: User | null;
}

const toDefaultValues = (
  editUser?: User | null,
): Partial<EmployeeFormValues> | undefined => {
  if (!editUser) return undefined;

  return {
    firstName: editUser.firstName ?? editUser.fname ?? "",
    lastName: editUser.lastName ?? editUser.lname ?? "",
    email: editUser.email ?? "",
    username: editUser.username ?? "",
    teamLeadId: editUser.teamLeadId ?? "",
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

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  editUser,
}: AddEmployeeModalProps) {
  const handleSubmit = async (values: EmployeeFormValues) => {
    await onSubmit({
      ...values,
      username: values.username ?? editUser?.username ?? "",
      password: values.password ?? "",
      teamLeadId: values.teamLeadId ?? editUser?.teamLeadId ?? "",
    });
  };

  return (
    <FeatureAddEmployeeModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      defaultValues={toDefaultValues(editUser)}
      title={editUser ? "Edit Employee" : "Add Employee"}
      isEdit={!!editUser}
      submitLabel={editUser ? "Save Changes" : "Create Employee"}
    />
  );
}
