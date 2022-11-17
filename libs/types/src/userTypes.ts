export interface User {
  username: string;
  mail: string;
  roles: UserRole[];
  ftp: number;
}

export interface UserBase {
  username: string;
  mail: string;
}

export enum UserRole {
  DEFAULT = 'DEFAULT',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}
