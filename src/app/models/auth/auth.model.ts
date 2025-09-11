export interface RegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthApiResponse {
  error: boolean;
  success: boolean;
  accessToken: string;
  payload?: User;
  expireIn: number;
}
