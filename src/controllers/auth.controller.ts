import User from "../models/user.model.js";
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../utils/jwt.js";

const cookieOptions = {
  httpOnly: true, // not accessible by JS like xss
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict" as const, // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

class AuthController {
  //register
  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError("All fields are required", 400);
    }

    const existingUser = await User.findOne(email);

    if (existingUser) throw new AppError("Email already exists", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const saveUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    //genearte token
    const accessToken = signAccessToken({
      userId: saveUser._id.toString(),
      role: saveUser.role,
    });

    const refreshToken = signRefreshToken({
      userId: saveUser._id.toString(),
      role: saveUser.role,
    });

    // hash refresh token before storing
    saveUser.refreshToken = await bcrypt.hash(refreshToken, 10);
    await saveUser.save({ validateBeforeSave: false });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: saveUser._id,
        name: saveUser.name,
        email: saveUser.email,
        role: saveUser.role,
      },
    });
  });

  //login
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password required", 400);
    }

    // get user with password and refreshToken
    const user = await User.findOne({ email }).select(
      "+password +refreshToken",
    );

    if (!user) throw new AppError("Invalid credentials", 401);

    //verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

    //genearte token
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      role: user.role,
    });

    // hash and store refresh token
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });

  //refresh access token
  refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string;

    if (!refreshToken) throw new AppError("Refresh token not found", 401);

    // verify refresh token with public key
    const decoded = verifyToken(refreshToken);
    if (decoded.type !== "refresh")
      throw new AppError("Invalid token type", 401);

    // find user
    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || !user.refreshToken)
      throw new AppError("Invalid refresh token", 401);

    // compare refresh token with stored hash
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new AppError("Invalid refresh token", 401);

    // rotate - generate new tokens
    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      userId: user._id.toString(),
      role: user.role,
    });

    // update stored refresh token
    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      newAccessToken,
    });
  });

  //logout
  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw new AppError("Already logged out", 400);

    // verify and clear
    const decoded = verifyToken(refreshToken);

    await User.findOneAndUpdate(
      { _id: decoded.userId },
      {
        refreshToken: null,
      },
    );

    //clear cookie
    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json({
      success: true,
      message: "Logout Successfully",
    });
  });

  //get Current User
  getme = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?.id);
    if (!user) throw new AppError("User not found", 404);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
}

export default new AuthController();
