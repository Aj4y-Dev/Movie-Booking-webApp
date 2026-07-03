import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "../utils/jwt.js";

export let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // authenticate socket connection using JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = verifyToken(token);
      if (decoded.type !== "access") return next(new Error("Invalid token"));

      // attach user to socket
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    // user joins a show room to get realtime seat updates
    socket.on("join:show", (showId: string) => {
      socket.join(`show:${showId}`);
      console.log(`User ${socket.data.userId} joined show:${showId}`);
    });

    // user leaves show room
    socket.on("leave:show", (showId: string) => {
      socket.leave(`show:${showId}`);
      console.log(`User ${socket.data.userId} left show:${showId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
};

// emit helpers called from controllers
export const emitSeatLocked = (
  showId: string,
  seatIds: string[],
  userId: string,
  lockExpiresAt: Date,
) => {
  io.to(`show:${showId}`).emit("seat:locked", {
    seatIds,
    lockedBy: userId,
    lockExpiresAt,
  });
};

export const emitSeatReleased = (showId: string, seatIds: string[]) => {
  io.to(`show:${showId}`).emit("seat:released", { seatIds });
};

export const emitSeatBooked = (showId: string, seatIds: string[]) => {
  io.to(`show:${showId}`).emit("seat:booked", { seatIds });
};
