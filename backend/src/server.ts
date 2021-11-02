import * as userService from "./services/userService";
import * as validationService from "./services/validationService";
import * as express from "express";
import * as types from "../../common/types/apiTypes";
import { ApiStatus } from "../../common/types/apiTypes";
// const express = require("express");
const http = require("http");
const dotenv = require("dotenv");

// Create a new express app instance
dotenv.config();
// const app = express();
const app = express.default();
const cors = require("cors");

const httpPort = process.env.PORT;

app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);

app.get<null, types.WorkoutsSuccessBody>(
  "/me/workouts",
  validationService.authenticateToken,
  (req, res) => {
    res.send({ workouts: [], status: ApiStatus.SUCCESS });
  }
);

app.post<null, types.LoginSuccessResponseBody, types.LoginRequestBody>(
  "/validate",
  (req, res) => {
    console.log("validater");
    req;
    // res.send({
    //   username: req.body.username,
    //   role: userService.getUserRoles(req.body.username),
    // });
  }
);

app.post<null, types.LoginResponseBody, types.LoginRequestBody>(
  "/login",
  async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = validationService.hash(password);
    console.log("hashedPassword", hashedPassword);
    if (userService.validateUser(username, hashedPassword)) {
      const token = validationService.generateAccessToken(username);
      const userRoles = userService.getUserRoles(username);
      res.send({
        status: ApiStatus.SUCCESS,
        username,
        token,
        roles: userRoles,
      });
      return;
    }

    res.statusMessage = "Invalid username or password.";
    res.statusCode = 401;
    res.send({
      status: ApiStatus.FAILURE,
      message: "Invalid username or password",
    });
  }
);

httpServer.listen(httpPort, () => {
  console.log(`App is listening on port ${httpPort}!:)`);
});
