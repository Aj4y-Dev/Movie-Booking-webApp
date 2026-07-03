import Seat from "../models/seat.model.js";
import { io } from "../socket/index.js";

export const cleanupExpiredLocks = async () => {
  const now = new Date();

  // find expired locked seats grouped by show
  const expiredSeats = await Seat.find({
    isLocked: true,
    lockExpiresAt: { $lt: now },
  }).select("_id show");

  if (!expiredSeats.length) return;

  // group by show for socket emit
  const showMap = new Map<string, string[]>();
  expiredSeats.forEach((seat) => {
    const showId = seat.show.toString();
    if (!showMap.has(showId)) showMap.set(showId, []);
    showMap.get(showId)!.push(seat._id.toString());
  });

  // release all expired locks
  await Seat.updateMany(
    { isLocked: true, lockExpiresAt: { $lt: now } },
    {
      isLocked: false,
      lockedBy: null,
      lockedAt: null,
      lockExpiresAt: null,
    },
  );

  // emit seat released for each show
  showMap.forEach((seatIds, showId) => {
    io.to(`show:${showId}`).emit("seat:released", { seatIds });
  });

  console.log(`Cleaned up ${expiredSeats.length} expired seat locks`);
};
