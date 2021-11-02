export interface User {
  username: string;
  email: string;
  roles: UserRoles[];
}

export interface UserStore {
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
