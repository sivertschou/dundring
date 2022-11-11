import { removeDuplicateWords } from './string';

const getIllegalUsernameCharacters = (username: string): string[] => {
  return username.split('').filter((x) => !legalUsernameCharacters.includes(x));
};

export const illegalCharactersInUsername = (username: string) =>
  removeDuplicateWords(getIllegalUsernameCharacters(username));

export const usernameContainsIllegalCharacters = (username: string) =>
  illegalCharactersInUsername(username).length > 0;

export const maxUsernameLength = 20;
export const usernameIsTooLong = (username: string) =>
  username.length > maxUsernameLength;

export const usernameIsValid = (username: string) =>
  !usernameIsTooLong(username) && !usernameContainsIllegalCharacters(username);

const legalUsernameCharacters = 'abcdefghifjklmnopqrstuvwxyz0123456789'.split(
  ''
);

export const mailIsValid = (mail: string) => /.+@.+\..+/.test(mail.trim());
