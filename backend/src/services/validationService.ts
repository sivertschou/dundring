import { User } from "../../../common/types/userTypes";

const jwt = require("jsonwebtoken");
import crypto from "crypto";
import { NextFunction } from "express";
import { Request, Response } from "express-serve-static-core";
import { WorkoutsSuccessResponseBody } from "../../../common/types/apiTypes";


const validateLogin = (username: string, password: string) => { };

export const hash = (message: string) => {
  return crypto.createHash("md5").update(message).digest("hex");
};

export const generateAccessToken = (username: string) => {
  return jwt.sign({ username }, process.env.TOKEN_SECRET, {
    expiresIn: "120d",
  });
};
declare module "express" {
  export interface Request {
    user?: User; // adding our custom declaration.
  }
}


type RequestBody = {
  headers: Record<string, any>,
  user?: User
}

export const authenticateToken = (
  req: Request<null, WorkoutsSuccessResponseBody> & RequestBody,
  res: Response<WorkoutsSuccessResponseBody>,
  next: NextFunction
) => {
  console.log("headers:", req.headers);
  const authHeader = req.headers["authorization"];
  console.log("authHeader:", authHeader);
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err: Error, user: User) => {
    console.log("error:", err);

    if (err) {
      return res.sendStatus(401);
    }
    console.log("user", user);
    req.user = user;
    next();
  });
};
