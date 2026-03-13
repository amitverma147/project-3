import bcrypt from "bcryptjs";
import User from "../models/users/User.js";
import type { IUser } from "../models/users/user.types.js";

export const createUserService = async (userData: IUser): Promise<IUser> => {
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  const user = new User(userData);
  return await user.save();
};

export const getAllUsersService = async (
  filter: Record<string, unknown> = {},
  options?: {
    page?: number;
    limit?: number;
  },
): Promise<IUser[]> => {
  const query = User.find(filter).select("-password");

  // Apply pagination if provided
  if (options?.page && options?.limit) {
    const skip = (options.page - 1) * options.limit;
    query.skip(skip).limit(options.limit);
  }

  return await query.lean();
};

export const getUsersCountService = async (
  filter: Record<string, unknown> = {},
): Promise<number> => {
  return await User.countDocuments(filter);
};

export const getUserByIdService = async ({
  id,
  selectFields = [],
}: {
  id: string;
  selectFields?: string[];
}): Promise<IUser | null> => {
  const query = User.findById(id);
  if (selectFields.length) query.select(selectFields.join(" "));
  return await query.lean();
};

export const updateUserService = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<IUser>;
}): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
};

export const transferEmployeeService = async ({
  id,
  newTeamLeadId,
  newManagerId,
}: {
  id: string;
  newTeamLeadId: string;
  newManagerId: string | null;
}): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    id,
    { teamLeadId: newTeamLeadId, managerId: newManagerId },
    { new: true },
  ).lean();
};
