const fs = require("fs");

const usersFilename = process.env.USERS_FILENAME;

export const getUsers = () => {
  if (fs.existsSync(usersFilename)) {
    const rawdata = fs.readFileSync(usersFilename);
    const parsedData = JSON.parse(rawdata);

    return [...parsedData];
  }

  return [];
};

export const getUser = (username: string) => {
  const users = getUsers();

  const user = users.find((user) => user.username === username);

  return user;
};

export const validateUser = (username: string, hashedPassword: string) => {
  const user = getUser(username);

  if (user && user.password === hashedPassword) {
    return true;
  }

  return false;
};

export const getUserRoles = (username: string): string[] => {
  const user = getUser(username);
  if (!user) {
  }
  return user && user.roles;
};
