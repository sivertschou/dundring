export interface User {
  username: string;
  mail: string;
  ftp: number;
}

export interface UserBase {
  username: string;
  mail: string;
}

export type AuthenticationType = MailAuthentication;

export interface MailAuthentication {
  type: 'mail';
  mail: string;
}
