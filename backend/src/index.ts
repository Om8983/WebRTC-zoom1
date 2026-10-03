import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
// os , cluster, http, fetch are the by default libs that comes with node. You don't have to install any libs for them
import os from "os";
import { initiateWSS } from "./wsServer";
import googleRouter from "./router/AuthRoutes/router";
import userRouter from "./router/meetingRoutes/route";
const app = express();

// just for understanding
const cpu = os.cpus().length;
console.log("cpu length ::: ", cpu);
// to convert the incoming json to readable format
app.use(express.json());

// to parse the json tokens
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
const PORT = process.env.BACKEND_PORT;

// creating a server to initiate the websocket signaling server connection.
const server = http.createServer(app);
initiateWSS(server);

app.use("api/v1/users", userRouter);
app.use("/auth", googleRouter);

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
