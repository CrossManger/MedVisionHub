export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}
