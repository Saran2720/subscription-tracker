import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name } = req.body;
    console.log(req.user.userId, req.params.id);

    if (req.user.userId !== req.params.id) {
      const error = new Error(
        "You are not the owner of this account - access denied",
      );
      error.statusCode = 401;
      throw error;
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const deleteuser = async (req, res, next) => {
  try {
    if (req.user.userId !== req.params.id) {
      const error = new Error(
        "You are not the owner of this account - access denied",
      );
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    await Subscription.deleteMany({ user: req.params.id });
    res
      .status(200)
      .json({ success: true, message: "user delted successfully" });
  } catch (error) {
    next(error);
  }
};
