import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const port = process.env.PORT;

if (!port) {
  throw new Error("port number is missing");
}

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

app.listen(port, () => {
  console.log(`App is listen in port: ${port}`);
});
