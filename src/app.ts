import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import AppError from "./utils/AppError.js";

import { connectDb } from "./config/db.js";

dotenv.config();

const app = express();

const port = process.env.PORT;

if (!port) {
  throw new AppError("port number is missing", 500);
}

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

app.listen(port, () => {
  connectDb(process.env.MONGO_DB_URL!); //! Trust me, this value isn't undefined.
  console.log(`App is listen in port: ${port}`);
});
