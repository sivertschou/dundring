export interface User {
  username: string;
  email: string;
  roles: UserRoles[];
}

export interface StoredUser {
  username: string;
  email: string;
  roles: UserRoles[];
  password: string;
}

export enum UserRoles {
  DEFAULT = "DEFAULT",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}
