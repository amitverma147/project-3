import bcrypt from "bcryptjs";
import User from "../models/users/User.js";
import type { IUser } from "../models/users/user.types.js";
import { UserRole } from "../models/users/user.types.js";
import { generateEmployeeId } from "../utils/userHelper.js";

export const loginService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<IUser | null> => {
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password as string);
  if (!isMatch) return null;

  return user;
};

export const registerService = async ({
  username,
  email,
  password,
  mobileNumber,
  role = UserRole.ADMIN,
  firstName,
  lastName,
  dob,
}: {
  username: string;
  email: string;
  password: string;
  mobileNumber: string;
  role?: UserRole;
  firstName: string;
  lastName: string;
  dob: Date;
}): Promise<IUser> => {
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    const err = new Error("Email already registered") as Error & {
      statusCode: number;
    };
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);

  const employeeId = await generateEmployeeId({
    firstName,
    lastName,
    dob,
    mobileNumber,
  });

  const user = await User.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
    mobileNumber: mobileNumber.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    dob,
    employeeId,
    role,
  });
  return user;
};
