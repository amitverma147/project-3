import { AxiosError } from "axios";

export function isUnauthorizedError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return axiosError.response?.status === 401;
}
