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
  return apiPost<AuthResponse>("/auth/login", {
    email,
    password,
  });
}

export async function register(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/register", {
    email,
    password,
  });
}

export async function getMe(): Promise<MeResponse> {
  return apiGet<MeResponse>("/auth/me");
}
