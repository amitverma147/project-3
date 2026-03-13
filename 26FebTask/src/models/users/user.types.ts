export enum UserRole {
  EMPLOYEE = "employee",
  ADMIN = "admin",
  MANAGER = "manager",
  TEAM_LEAD = "team_lead",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface Address {
  houseNumber: string;
  street: string;
  floorNumber?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
}

export interface IUser {
  _id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role: UserRole;
  status?: UserStatus;
  employeeId?: string;
  dob?: Date;
  mobileNumber: string; // with country code
  address?: Address;
  aboutMe?: string; // max 50 words
  managerId?: string | null;
  teamLeadId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
