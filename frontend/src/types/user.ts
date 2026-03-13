export type UserRole = "admin" | "manager" | "team_lead" | "employee";
export type UserStatus = "active" | "inactive";

// ── Sub-types
export interface Address {
  houseNumber: string;
  street: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  floorNumber?: string;
  landmark?: string;
}

export interface User {
  _id: string;
  username?: string;
  fname?: string;
  lname?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  employeeId?: string;
  dob?: string;
  mobileNumber: string;
  address?: Address;
  aboutMe?: string;
  managerId?: string | null;
  teamLeadId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Payloads
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  dob: string; // ISO date string
  role: UserRole;
  address: Address;
  username?: string;
  aboutMe?: string;
  managerId?: string;
  teamLeadId?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  mobileNumber?: string;
  dob?: string;
  aboutMe?: string;
  address?: Partial<Address>;
  managerId?: string;
  teamLeadId?: string;
}

export interface TransferEmployeePayload {
  teamLeadId: string;
}

// ── API respons
export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface LoginResponse {
  _id: string;
  email: string;
  role: UserRole;
  mobileNumber: string;
  username?: string;
}
