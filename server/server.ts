import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import errorHandler from "@/middleware/errorHandler.js";

const app = express();

app.use(cors({
	origin: "http://localhost:3000",
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);
app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));