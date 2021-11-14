import { StoredUser, UserRole } from "../../../common/types/userTypes";
require("dotenv").config();
import * as fs from "fs";
import { Workout } from "../../../common/types/workoutTypes";

const usersPath = `${process.env.DATA_PATH}/users.json`;

export const getUsers = (): StoredUser[] => {
  if (fs.existsSync(usersPath)) {
    const rawdata = fs.readFileSync(usersPath);
    return JSON.parse(rawdata.toString()) as StoredUser[];
  }

  return [];
};

export const getUser = (username: string): StoredUser | null =>
  getUsers().find((user) => user.username === username) || null;

export const validateUser = (
  username: string,
  hashedPassword: string
): boolean => {
  const user = getUser(username);

  return user?.password === hashedPassword;
};

export const getUserRoles = (username: string): UserRole[] => {
  const user = getUser(username);
  return user ? user.roles : [];
};
export const getUserWorkouts = (username: string): Workout[] => {
  console.log("getUserWorkouts:", username);
  const user = getUser(username);
  return user ? user.workouts : [];
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
  user: StoredUser
): Status<StoredUser, "User already exists" | "File not found"> => {
  if (getUser(user.username)) {
    return { status: "ERROR", type: "User already exists" };
  }

  if (fs.existsSync(usersPath)) {
    const rawdata = fs.readFileSync(usersPath);
    const parsedData = JSON.parse(rawdata.toString()) as StoredUser[];

    fs.writeFileSync(usersPath, JSON.stringify([...parsedData, user]));
    return { status: "SUCCESS", data: user };
  } else {
    console.error("File not found", usersPath);
    return { status: "ERROR", type: "File not found" };
  }
};
