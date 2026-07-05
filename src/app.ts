import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { initSocket } from "./socket/index.js";
import { createServer } from "http";
import { connectDb } from "./config/db.js";
import { cleanupExpiredLocks } from "./utils/seatLockCleanup.js";
import movieRouter from "./routes/movie.route.js";
import theatreRouter from "./routes/theatre.route.js";
import authRouter from "./routes/auth.route.js";
import showRouter from "./routes/show.route.js";
import bookRouter from "./routes/booking.route.js";
import paymentRouter from "./routes/payment.route.js";
import AppError from "./utils/AppError.js";
import errorHandler from "./middleware/errorHandler.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const httpServer = createServer(app); // http server wraps express
initSocket(httpServer); // attach socket.io to http server
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet()); // Adds secure HTTP headers to reduce the risk of common web attacks (XSS, clickjacking, MIME sniffing, etc.)
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
app.use("/api/vq", bookRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(generalLimiter);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

app.use(errorHandler);

setInterval(cleanupExpiredLocks, 60 * 1000);

if (!port) {
  throw new AppError("port number is missing", 500);
}

httpServer.listen(port, () => {
  connectDb(process.env.MONGO_DB_URL!);
  console.log(`App is listen in port: ${port}`);
});
