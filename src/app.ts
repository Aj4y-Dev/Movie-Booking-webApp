import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import AppError from "./utils/AppError.js";

import { connectDb } from "./config/db.js";
import movieRouter from "./routes/movie.route.js";
import theatreRouter from "./routes/theatre.route.js";
import authRouter from "./routes/auth.route.js";
import showRouter from "./routes/show.route.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use("/api/v1", movieRouter);
app.use("/api/v1", theatreRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", showRouter);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

app.use(errorHandler);

if (!port) {
  throw new AppError("port number is missing", 500);
}

app.listen(port, () => {
  connectDb(process.env.MONGO_DB_URL!); //! Trust me, this value isn't undefined.
  console.log(`App is listen in port: ${port}`);
});
