interface UserActiveRooms {
  [];
}
const usersAndActiveRooms = {};

export const generateRandomString = (length: number) => {
  const alphabet = "0123456789";
  const generatedString = new Array(length).fill(0).reduce((result) => {
    return result + alphabet.substr(Math.random() * alphabet.length, 1);
  }, "") as string;

  return generatedString;
};
