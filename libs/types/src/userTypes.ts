import { Scopes } from '@dundring/frontend/src/types';

export interface User {
  username: string;
  mail: string;
  ftp: number;
}

export interface UserBase {
  id: string;
  username: string;
}

export interface UserCreationStrava {
  athleteId: number;
  refreshToken: string;
  scopes: Scopes;
}
