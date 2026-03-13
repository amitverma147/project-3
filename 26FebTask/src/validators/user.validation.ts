import { UserRole } from "../models/users/user.types.js";
import type { Address, IUser } from "../models/users/user.types.js";

export type CreateUserInput = Omit<
  IUser,
  "_id" | "employeeId" | "createdAt" | "updatedAt" | "dob"
> & {
  dob: string;
};

export type UpdateUserInput = Partial<
  Omit<IUser, "_id" | "employeeId" | "createdAt" | "updatedAt" | "dob"> & {
    dob: string;
    address: Partial<Address>;
  }
>;

// helpers

function isAtLeast18(val: string): boolean {
  const date = new Date(val);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()))
    age--;
  return age >= 18;
}

function wordCount(str: string): number {
  return str.trim().split(/\s+/).length;
}

const mobileRegex = /^\+[1-9]\d{1,3}[0-9]{7,12}$/;

// ── Validation functions

export function validateAddress(
  addr: Partial<Address>,
  partial = false,
): string[] {
  const errors: string[] = [];
  if (!partial || addr.houseNumber !== undefined) {
    if (!addr.houseNumber?.trim()) errors.push("House number is required");
  }
  if (!partial || addr.street !== undefined) {
    if (!addr.street?.trim()) errors.push("Street is required");
  }
  if (!partial || addr.pincode !== undefined) {
    if (!addr.pincode?.trim()) errors.push("Pincode is required");
  }
  if (!partial || addr.city !== undefined) {
    if (!addr.city?.trim()) errors.push("City is required");
  }
  if (!partial || addr.state !== undefined) {
    if (!addr.state?.trim()) errors.push("State is required");
  }
  if (!partial || addr.country !== undefined) {
    if (!addr.country?.trim()) errors.push("Country is required");
  }
  return errors;
}

export function validateCreateUser(body: CreateUserInput): string[] {
  const errors: string[] = [];

  if (!body.firstName?.trim()) errors.push("First name is required");
  if (!body.lastName?.trim()) errors.push("Last name is required");

  if (!body.dob) {
    errors.push("Date of birth is required");
  } else if (!isAtLeast18(body.dob)) {
    errors.push("Employee must be at least 18 years old");
  }

  if (!body.mobileNumber) {
    errors.push("Mobile number is required");
  } else if (!mobileRegex.test(body.mobileNumber)) {
    errors.push("Invalid mobile number with country code");
  }

  if (!body.address) {
    errors.push("Address is required");
  } else {
    errors.push(...validateAddress(body.address));
  }

  if (body.aboutMe !== undefined && wordCount(body.aboutMe) > 50) {
    errors.push("About Me cannot exceed 50 words");
  }

  if (!body.role || !Object.values(UserRole).includes(body.role)) {
    errors.push(
      `role is required and must be one of: ${Object.values(UserRole).join(", ")}`,
    );
  }

  return errors;
}

export function validateUpdateUser(body: UpdateUserInput): string[] {
  const errors: string[] = [];

  if (body.dob !== undefined && !isAtLeast18(body.dob)) {
    errors.push("Employee must be at least 18 years old");
  }

  if (body.mobileNumber !== undefined && !mobileRegex.test(body.mobileNumber)) {
    errors.push("Invalid mobile number with country code");
  }

  if (body.address !== undefined) {
    errors.push(...validateAddress(body.address, true));
  }

  if (body.aboutMe !== undefined && wordCount(body.aboutMe) > 50) {
    errors.push("About Me cannot exceed 50 words");
  }

  return errors;
}
