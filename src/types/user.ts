export type UserRole = "operator" | "supervisor" | "admin";

export interface User {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  role: UserRole;
  shift?: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserCreatePayload {
  employeeCode: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  shift?: string;
  isVerified?: boolean;
}

export interface UserUpdatePayload {
  fullName?: string;
  role?: UserRole;
  shift?: string;
  isVerified?: boolean;
  isActive?: boolean;
}
