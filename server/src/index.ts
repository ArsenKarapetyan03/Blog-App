import express from "express";
import "dotenv/config";
import cors from "cors";
import blogRoutes from "./routes/blog.routes.js";

const app = express();

app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());

app.use("/post", blogRoutes);

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));