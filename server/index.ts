import express from "express";
import "dotenv/config";
import cors from "cors";
import db from "./models"
import indexRouter from "./routes";
const app = express();

app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());
app.use("/api", indexRouter);

app.get('/api', (req, res) => {
	res.send("Welcome to the API!");
})
await db.sequelize.authenticate();
app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.API_URL}`));