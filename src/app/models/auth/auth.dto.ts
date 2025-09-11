export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

export interface AuthApiResponseDTO {
  error: boolean;
  success: boolean;
  access_token: string;
  payload?: UserDTO;
  expiresIn: number;
}