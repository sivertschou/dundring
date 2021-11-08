import { NextFunction, Request, Response } from "express";
import { User } from "../../../common/types/userTypes";

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const validateLogin = (username: string, password: string) => {};

export const hash = (message: string) => {
  return crypto.createHash("md5").update(message).digest("hex");
};

export const generateAccessToken = (username: string) => {
  return jwt.sign({ username }, process.env.TOKEN_SECRET, {
    expiresIn: "120d",
  });
};
export interface AuthenticatedRequest<T> extends Request<T> {
  username?: string;
}
export const authenticateToken = <T, R>(
  req: AuthenticatedRequest<T>,
  res: Response<R>,
  next: any
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.statusMessage = "No token provided.";
    return res.sendStatus(401);
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET,
    (err: Error, user: { username: string }) => {
      if (err) {
        res.statusMessage = "Could not verify token.";
        return res.sendStatus(401);
      }
      req.username = user.username;
      next();
    }
  );
};
