export interface User {
  username: string;
  email: string;
  roles: UserRoles[];
}

export enum UserRoles {
  DEFAULT = "DEFAULT",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}
