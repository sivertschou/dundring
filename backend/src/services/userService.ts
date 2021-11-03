import { UserStore } from "../../../common/types/userTypes";
require("dotenv").config();
const fs = require("fs");

const usersPath = `${process.env.DATA_PATH}/users.json`;

export const getUsers = () => {
  if (fs.existsSync(usersPath)) {
    const rawdata = fs.readFileSync(usersPath);
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
interface SuccessStatus<T> {
  status: "SUCCESS";
  data: T;
}
interface ErrorStatus<E> {
  status: "ERROR";
  type: E;
}

type Status<T, E> = SuccessStatus<T> | ErrorStatus<E>;

export const createUser = (
  user: UserStore
): Status<UserStore, "User already exists" | "File not found"> => {
  if (getUser(user.username)) {
    return { status: "ERROR", type: "User already exists" };
  }

  if (fs.existsSync(usersPath)) {
    const rawdata = fs.readFileSync(usersPath);
    const parsedData = JSON.parse(rawdata);

    fs.writeFileSync(usersPath, JSON.stringify([...parsedData, user]));
    return { status: "SUCCESS", data: user };
  } else {
    console.error("File not found", usersPath);
    return { status: "ERROR", type: "File not found" };
  }
};
