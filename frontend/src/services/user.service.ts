import api from "@/lib/api";
import {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  TransferEmployeePayload,
  ApiResponse,
} from "@/types/user";

export const userService = {
  getAll: (params?: { page?: number; limit?: number; role?: User["role"] }) => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", (params?.page || 1).toString());
    queryParams.append("limit", (params?.limit || 10).toString());
    if (params?.role) {
      queryParams.append("role", params.role);
    }
    return api.get<ApiResponse<User[]>>(`/users?${queryParams.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: CreateUserPayload) =>
    api.post<ApiResponse<User>>("/users", data),

  update: (id: string, data: UpdateUserPayload) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),

  transfer: (id: string, data: TransferEmployeePayload) =>
    api.patch<ApiResponse<User>>(`/users/${id}/transfer`, data),

  getTeamLeadsByManager: (managerId: string, params?: { page?: number }) => {
    const queryParams = new URLSearchParams({ managerId });
    queryParams.append("page", (params?.page || 1).toString());
    queryParams.append("limit", "10"); // always 10 results per page
    return api.get<ApiResponse<User[]>>(
      `/users/team-leads?${queryParams.toString()}`,
    );
  },
};
