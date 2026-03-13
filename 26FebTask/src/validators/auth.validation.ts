const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\+[1-9]\d{1,3}[0-9]{7,12}$/;

export interface LoginInput {
  email: string;
  password: string;
}

// register is ADMIN-only; role is always ADMIN and not accepted from the body
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  dob: string; // ISO date string
}

function isAtLeast18(val: string): boolean {
  const date = new Date(val);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return age >= 18;
}

export function validateLogin(body: Partial<LoginInput>): string[] {
  const errors: string[] = [];
  if (!body.email?.trim()) {
    errors.push("Email is required");
  } else if (!emailRegex.test(body.email.trim())) {
    errors.push("Invalid email format");
  }
  if (!body.password?.trim()) {
    errors.push("Password is required");
  }
  return errors;
}

export function validateRegister(body: Partial<RegisterInput>): string[] {
  const errors: string[] = [];
  if (!body.username?.trim()) errors.push("Username is required");
  if (!body.firstName?.trim()) errors.push("First name is required");
  if (!body.lastName?.trim()) errors.push("Last name is required");
  if (!body.email?.trim()) {
    errors.push("Email is required");
  } else if (!emailRegex.test(body.email.trim())) {
    errors.push("Invalid email format");
  }
  if (!body.password?.trim()) {
    errors.push("Password is required");
  } else if (body.password.trim().length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  if (!body.mobileNumber?.trim()) {
    errors.push("Mobile number is required");
  } else if (!mobileRegex.test(body.mobileNumber.trim())) {
    errors.push(
      "Invalid mobile number — include country code (e.g. +911234567890)",
    );
  }
  if (!body.dob) {
    errors.push("Date of birth is required");
  } else if (!isAtLeast18(body.dob)) {
    errors.push("Must be at least 18 years old");
  }
  return errors;
}
