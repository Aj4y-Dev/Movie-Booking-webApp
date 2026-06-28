import Jwt from "jsonwebtoken";
import { privateKey, publicKey } from "./keys.js";

export interface JWTPayload {
  userId: string;
  role: "CLIENT" | "USER" | "SYSTEM_ADMIN" | "ROOT_ADMIN";
  type: "access" | "refresh";
}

//Sign access token for 15 min
export const signAccessToken = (payload: Omit<JWTPayload, "type">): string => {
  //WITHOUT Omit : caller must pass type manually like signAccessToken({ userId: "123", role: "USER",type: "access" }) what if they pass wrong type? so Omit type is excluded from what caller passes
  return Jwt.sign({ ...payload, type: "access" }, privateKey, {
    algorithm: "RS256",
    expiresIn: "15m",
  });
};

//Sign refresh token for 7 days
export const signRefreshToken = (payload: Omit<JWTPayload, "type">): string => {
  return Jwt.sign({ ...payload, type: "refresh" }, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });
};

//Verify any token
export const verifyToken = (token: string) => {
  return Jwt.verify(token, publicKey, { algorithms: ["RS256"] }) as JWTPayload;
};
