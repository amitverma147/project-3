import api from "@/lib/api";
import {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  TransferEmployeePayload,
  ApiResponse,
} from "@/types/user";

export const userService = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const query = queryParams.toString();
    return api.get<ApiResponse<User[]>>(`/users${query ? `?${query}` : ""}`);
  },

  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: CreateUserPayload) =>
    api.post<ApiResponse<User>>("/users", data),

  update: (id: string, data: UpdateUserPayload) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),

  transfer: (id: string, data: TransferEmployeePayload) =>
    api.patch<ApiResponse<User>>(`/users/${id}/transfer`, data),

  getTeamLeadsByManager: (
    managerId: string,
    params?: { page?: number; limit?: number },
  ) => {
    const queryParams = new URLSearchParams({ managerId });
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    return api.get<ApiResponse<User[]>>(
      `/users/team-leads?${queryParams.toString()}`,
    );
  },
};
