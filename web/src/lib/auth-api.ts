import { apiGet, apiPost } from "./api";

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
};

type MeResponse = {
  id: string;
  email: string;
};

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/login", { email, password });
}

export async function register(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/register", { email, password });
}

export async function getMe(): Promise<MeResponse> {
  return apiGet<MeResponse>("/auth/me");
}

export async function logout(): Promise<void> {
  await apiPost<{ success: boolean }>("/auth/logout");
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/forgot-password", { email });
}

export function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/reset-password", {
    token,
    newPassword,
  });
}

export function verifyEmail(token: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/verify-email", {
    token,
  });
}

export function resendVerification(): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/resend-verification");
}
