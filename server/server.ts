import express from "express";
import "dotenv/config";
import cors from "cors";
import routes from "./routes";

const app = express();

app.use(cors({origin: "http://localhost:3000"}));
app.use(express.json());

app.use("/api", routes);

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.API_URL}`));