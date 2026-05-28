import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ status: "Server is up and running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
