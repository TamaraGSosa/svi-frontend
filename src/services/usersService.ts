import type { Paginated, User, UserCreatePayload, UserUpdatePayload } from "@/types";
import { apiRequest } from "./apiClient";

export const usersService = {
  list(page = 1, pageSize = 20): Promise<Paginated<User>> {
    return apiRequest<Paginated<User>>(
      "/users",
      { method: "GET" },
      { page, page_size: pageSize },
    );
  },

  getById(id: string): Promise<User> {
    return apiRequest<User>(`/users/${id}`, { method: "GET" });
  },

  create(payload: UserCreatePayload): Promise<User> {
    return apiRequest<User>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UserUpdatePayload): Promise<User> {
    return apiRequest<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
