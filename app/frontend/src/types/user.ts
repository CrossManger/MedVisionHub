export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  permissions?: string[];
}

export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}
