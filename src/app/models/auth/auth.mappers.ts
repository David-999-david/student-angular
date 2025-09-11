import { AuthApiResponseDTO } from './auth.dto';
import { AuthApiResponse } from './auth.model';

export function MapAuthResponse(dto: AuthApiResponseDTO): AuthApiResponse {
  return {
    error: dto.error,
    success: dto.success,
    accessToken: dto.access_token,
    payload: dto.payload,
    expireIn: dto.expiresIn,
  };
}
