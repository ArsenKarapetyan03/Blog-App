import * as http from "node:http";
import express from "express";
import "dotenv/config";
import cors from "cors";
import routes from "./routes/index.js";
import uploadsDirectory from "@/middleware/imagesMiddleware.js";
import errorHandler from "@/middleware/errorHandler.js";
import initWebSocketServer from "@/services/socket.service.js";

const app = express();

app.use(cors({ origin: "http://localhost:3000"}));
app.use(express.json());
app.use("/uploads", express.static(uploadsDirectory));
app.use("/api", routes);
app.use(errorHandler);

const server = http.createServer(app);

initWebSocketServer(server);

server.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));