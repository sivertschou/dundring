import * as messageService from "./services/messageService";
import * as userService from "./services/userService";
import * as validationService from "./services/validationService";
import * as express from "express";
import {
  ApiStatus,
  LoginRequestBody,
  LoginResponseBody,
  LoginSuccessResponseBody,
  MessagesResponseBody,
  RegisterRequestBody,
  WorkoutsSuccessResponseBody,
} from "../../common/types/apiTypes";
import { UserRoles } from "../../common/types/userTypes";

const http = require("http");
require("dotenv").config();

// Create a new express app instance
const app = express.default();
const cors = require("cors");

const httpPort = process.env.PORT;

app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);

app.get<null, WorkoutsSuccessResponseBody>(
  "/me/workouts",
  validationService.authenticateToken,
  (req, res) => {
    res.send({ workouts: [], status: ApiStatus.SUCCESS });
  }
);

app.post<null, LoginSuccessResponseBody, LoginRequestBody>(
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

app.get<null, MessagesResponseBody>("/messages", (req, res) => {
  const messages = messageService.getMessages();

  res.send({
    status: ApiStatus.SUCCESS,
    messages,
  });
});

app.post<null, LoginResponseBody, LoginRequestBody>(
  "/login",
  async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = validationService.hash(password);
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

app.post<null, LoginResponseBody, RegisterRequestBody>(
  "/register",
  async (req, res) => {
    const { username, password, email } = req.body;

    const hashedPassword = validationService.hash(password);

    const ret = userService.createUser({
      username: username,
      email: email,
      password: hashedPassword,
      roles: [UserRoles.DEFAULT],
    });

    if (ret.status === "ERROR") {
      const message = ret.type;
      let statusMessage = "Something went wrong.";
      let statusCode = 500;

      switch (message) {
        case "User already exists":
          statusMessage = "User already exists";
          statusCode = 400;
          break;
        case "File not found":
        default:
          break;
      }
      res.statusMessage = statusMessage;
      res.statusCode = statusCode;
      res.send({
        status: ApiStatus.FAILURE,
        message: statusMessage,
      });
      return;
    }

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
