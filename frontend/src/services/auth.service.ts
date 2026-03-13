import api from "@/lib/api";
import { User, ApiResponse, LoginResponse } from "@/types/user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  dob: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", data),

  logout: () => api.post<ApiResponse<null>>("/auth/logout"),


  register: (data: RegisterPayload) =>
    api.post<ApiResponse<null>>("/auth/register", data),

  me: () => api.get<ApiResponse<User>>("/auth/me"),
};
