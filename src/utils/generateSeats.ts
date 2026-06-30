import Seat from "../models/seat.model.js";
import mongoose from "mongoose";

export interface SeatPrices {
  standardPrice: number;
  premiumPrice: number;
  vipPrice: number;
}

//Every character has a unique numeric value called a Unicode(ASCII) code. row.charCodeAt(0) gives "A".charCodeAt(0) -> 65
// STANDARD → A-F  (index 0-5)  → front rows, closest to screen
// PREMIUM  → G-N  (index 6-13) → middle rows, best viewing angle
// VIP      → O-T  (index 14-19)→ back rows, most comfortable
const getSeatType = (row: string): "STANDARD" | "PREMIUM" | "VIP" => {
  const rowNum = row.charCodeAt(0) - 65; // A=0, B=1, C=2 ... T=19
  if (rowNum <= 5) return "STANDARD"; // A(0) B(1) C(2) D(3) E(4) F(5)
  if (rowNum <= 13) return "PREMIUM"; // G(6) H(7) I(8) J(9) K(10) L(11) M(12) N(13)
  return "VIP"; // O(14) P(15) Q(16) R(17) S(18) T(19)
};

// each row within same type has slightly different price
// STANDARD: A=300, B=310, C=320, D=330, E=340, F=350
// PREMIUM:  G=500, H=510, I=520, J=530, K=540, L=550, M=560, N=570 (capped at 600)
// VIP:      O=700, P=750, Q=800, R=850, S=900, T=1000
const getSeatPrice = (
  row: string,
  type: "STANDARD" | "PREMIUM" | "VIP",
  price: SeatPrices,
): number => {
  const rowIndex = row.charCodeAt(0) - 65;

  if (type === "STANDARD") {
    // A-F: base + 10 per row (300, 310, 320, 330, 340, 350)
    return price.standardPrice + rowIndex * 10;
  }

  if (type === "PREMIUM") {
    // G-N: base + 10 per row from G (500, 510, 520 ... up to 600)
    const premiumRowIndex = rowIndex - 6;
    return Math.min(price.premiumPrice + premiumRowIndex * 10, 600); //Math.min(..., 600) is just a SAFETY CAP i.e price wont accidentally exceed 600
  }

  //STANDARD and PREMIUM have linear pricing (+10 per row) but according to your layout, VIP has BIGGER jumps, so instead of a formula, we just hardcode each row's exact price
  // O-T: with bigger price jumps (700, 750, 800, 850, 900, 1000)
  const vipPrices = [700, 750, 800, 850, 900, 1000];
  const vipRowIndex = rowIndex - 14;
  return vipPrices[vipRowIndex] || price.vipPrice;
};

export const generateSeats = async (
  showId: string,
  totalSeats: number,
  prices: SeatPrices,
): Promise<void> => {
  const rows = "ABCDEFGHIJKLMNOPQRST"; //20 rows
  const seatsPerRow = 10;
  const seats = [];
  let seatCount = 0;

  for (let r = 0; r < rows.length; r++) {
    if (seatCount >= totalSeats) break;

    const row = rows[r];
    const type = getSeatType(row);
    const price = getSeatPrice(row, type, prices);

    for (let s = 1; s <= seatsPerRow; s++) {
      if (seatCount >= totalSeats) break;

      seats.push({
        show: new mongoose.Types.ObjectId(showId),
        seatNumber: `${row}${s}`, // "A1", "A2" ... "T10"
        row, // "A", "B" ... "T"
        type, // "STANDARD", "PREMIUM", "VIP"
        price, // price per row
        isBooked: false,
        isLocked: false,
      });

      seatCount++;
    }
  }

  // bulk insert all seats at once, faster than individual inserts
  await Seat.insertMany(seats);
};
