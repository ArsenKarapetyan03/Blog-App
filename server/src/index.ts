import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get("/", (req, res) => {
	res.json({ message: "Hello from Node.js Backend!" });
});

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));