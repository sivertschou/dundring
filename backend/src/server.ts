import * as messageService from "./services/messageService";
import * as userService from "./services/userService";
import * as groupSessionService from "./services/groupSessionService";
import * as validationService from "./services/validationService";
import * as express from "express";
import {
  ApiResponseBody,
  ApiStatus,
  LoginRequestBody,
  LoginResponseBody,
  MessagesResponseBody,
  RegisterRequestBody,
  WorkoutRequestBody,
  WorkoutsResponseBody,
} from "../../common/types/apiTypes";
import { UserRole } from "../../common/types/userTypes";
import {
  WebSocketRequest,
  WebSocketRequestType,
} from "../../common/types/wsTypes";
import * as WebSocket from "ws";

const http = require("http");
require("dotenv").config();

// Create a new express app instance
const app = express.default();
const cors = require("cors");
const router = express.Router();

const httpPort = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use("/api", router);

const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

router.get<null, ApiResponseBody<WorkoutsResponseBody>>(
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
router.post<WorkoutRequestBody, ApiResponseBody<WorkoutsResponseBody>>(
  "/me/workout",
  validationService.authenticateToken,
  (req: validationService.AuthenticatedRequest<WorkoutRequestBody>, res) => {
    const workout = req.body.workout;
    if (!req.username) {
      res.send({
        status: ApiStatus.FAILURE,
        message: "Unathorized",
      });
      return;
    }

    const ret = userService.saveWorkout(req.username, workout);

    switch (ret.status) {
      case "SUCCESS":
        res.send({
          status: ApiStatus.SUCCESS,
          data: { workouts: ret.data },
        });
        return;
      default:
        res.send({
          status: ApiStatus.FAILURE,
          message: ret.type,
        });
        return;
    }
  }
);
router.post<null, ApiResponseBody<LoginResponseBody>>(
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

router.get<null, ApiResponseBody<MessagesResponseBody>>(
  "/messages",
  (req, res) => {
    const messages = messageService.getMessages();

    res.send({
      status: ApiStatus.SUCCESS,
      data: { messages },
    });
  }
);

router.post<null, ApiResponseBody<LoginResponseBody>, LoginRequestBody>(
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

router.post<null, ApiResponseBody<LoginResponseBody>, RegisterRequestBody>(
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

// TODO: figure out why a connect is triggered several times.
//       This is probably due to some fishy rerender.
wss.on("connection", (ws) => {
  console.log("connection");
  let username = "";
  ws.on("message", (rawData) => {
    const req = JSON.parse(rawData.toString()) as WebSocketRequest;
    switch (req.type) {
      case WebSocketRequestType.createGroupSession: {
        const { member } = req;
        username = member.username;
        ws.send(
          JSON.stringify(
            groupSessionService.createRoom({ ...member, socket: ws })
          )
        );
        break;
      }
      case WebSocketRequestType.joinGroupSession: {
        const { roomId, member } = req;
        username = member.username;

        groupSessionService.joinRoom(ws, roomId, {
          ...member,
          socket: ws,
        });
        break;
      }
      case WebSocketRequestType.leaveGroupSession: {
        const { username } = req;
        groupSessionService.leaveRoom(username);
        break;
      }
      case WebSocketRequestType.sendData: {
        if (!username) {
          console.log("unknown tried to share workoutdata");
          return;
        }
        groupSessionService.sendWorkoutDataToRoom(username, req.data);
        break;
      }
    }
  });
  ws.on("close", () => {
    console.log("connection closed", username);
    if (username) {
      groupSessionService.leaveRoom(username);
      username = "";
    }
  });
});

httpServer.listen(httpPort, () => {
  console.log(`App is listening on port ${httpPort}!:)`);
});
