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
import { Socket, Server } from "socket.io";

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
const io: Server = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
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
    console.log("request:", req.body);
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
        console.log("SUCCESS");
        res.send({
          status: ApiStatus.SUCCESS,
          data: { workouts: ret.data },
        });
        return;
      default:
        console.log("FAILURE");

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

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log(socket.data.username, "disconnected");

    groupSessionService.leaveRoom(socket.data.username, socket, io);
  });
  socket.on("group_message", (message) => {
    groupSessionService.sendMessageToRoom(socket, io, message);
  });
  socket.on("workout_data", (data: { heartRate?: number; power?: number }) => {
    console.log("workout_data received!", data);
    groupSessionService.sendWorkoutDataToRoom(socket, io, data);
  });

  socket.on("create_group_session", (member: groupSessionService.Member) => {
    const room = groupSessionService.createRoom(socket, member);
    if (room === null) {
      socket.emit("group_session_creation_failed");
      return;
    }
    socket.data = { username: member.username };

    console.log(`${member.username} created room with id: ${room.id}`);
    socket.emit("group_session_created", room);
  });

  socket.on(
    "join_group_session",
    (body: { member: groupSessionService.Member; roomId: string }) => {
      const { member, roomId } = body;
      socket.data = { username: member.username };
      const ret = groupSessionService.joinRoom(roomId, member, socket, io);
      if (ret.status === "SUCCESS") {
        socket.emit("group_session_joined", ret.data);
      } else {
        socket.emit("failed_to_join_group_session", ret.type);
      }
    }
  );
});

httpServer.listen(httpPort, () => {
  console.log(`App is listening on port ${httpPort}!:)`);
});
