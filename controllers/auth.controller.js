import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const signup = async (req, res, next) => {
  //Atomicity in ACID
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //logic to create a new user
    const { name, email, password } = req.body;

    //check if the use alredy exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exist");
      error.statusCode = 409;
      throw error;
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session },
    );

    //jwt token
    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    //commit the transaction
    await session.commitTransaction();
    await session.endSession();

    res.status(201).json({
      success: true,
      message: "User created successfully",

      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    //if something went wrong aboart transaction ( Atomicity - either full success or fully unsuccess)
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    await session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //check if the use alredy exist
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }

    //token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    //return res
    res.status(200).json({
      success: true,
      message: "Sign in successfull",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    // Invalidate the token on the client side by sending an empty token or a message
    res.status(200).json({
      success: true,
      message: "Sign out successful",
      data: {
        token: null, // or you can send a message like "Token invalidated"
      },
    });
  } catch (error) {
    next(error);
  }
};
