import * as messageService from "./services/messageService";
import * as userService from "./services/userService";
import * as validationService from "./services/validationService";
import * as express from "express";
import {
  ApiResponseBody,
  ApiStatus,
  LoginRequestBody,
  LoginResponseBody,
  MessagesResponseBody,
  RegisterRequestBody,
  WorkoutsResponseBody,
} from "../../common/types/apiTypes";
import { UserRole } from "../../common/types/userTypes";

const http = require("http");
require("dotenv").config();

// Create a new express app instance
const app = express.default();
const cors = require("cors");

const httpPort = process.env.PORT;

app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);

app.get<null, ApiResponseBody<WorkoutsResponseBody>>(
  "/me/workouts",
  validationService.authenticateToken,
  (req: validationService.AuthenticatedRequest<null>, res) => {
    const workouts = userService.getUserWorkouts(req.username || "");
    res.send({
      status: ApiStatus.SUCCESS,
      data: { workouts },
    });
  }
);
app.post<null, ApiResponseBody<LoginResponseBody>>(
  "/validate",
  validationService.authenticateToken,
  async (req: validationService.AuthenticatedRequest<null>, res) => {
    const username = req.username;
    const user = userService.getUser(username || "");
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!user) {
      return;
    }

    res.send({
      status: ApiStatus.SUCCESS,
      data: { roles: user.roles, token: token || "", username: user.username },
    });
    return;
  }
);

app.get<null, ApiResponseBody<MessagesResponseBody>>(
  "/messages",
  (req, res) => {
    const messages = messageService.getMessages();

    res.send({
      status: ApiStatus.SUCCESS,
      data: { messages },
    });
  }
);

app.post<null, ApiResponseBody<LoginResponseBody>, LoginRequestBody>(
  "/login",
  async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = validationService.hash(password);
    if (userService.validateUser(username, hashedPassword)) {
      const token = validationService.generateAccessToken(username);
      const userRole = userService.getUserRoles(username);
      res.send({
        status: ApiStatus.SUCCESS,
        data: {
          username,
          token,
          roles: userRole,
        },
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

app.post<null, ApiResponseBody<LoginResponseBody>, RegisterRequestBody>(
  "/register",
  async (req, res) => {
    const { username, password, mail } = req.body;

    const hashedPassword = validationService.hash(password);

    const ret = userService.createUser({
      username: username,
      mail: mail,
      password: hashedPassword,
      roles: [UserRole.DEFAULT],
      workouts: [],
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
      const userRole = userService.getUserRoles(username);
      res.send({
        status: ApiStatus.SUCCESS,
        data: {
          username,
          token,
          roles: userRole,
        },
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
