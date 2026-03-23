import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
  console.log(`user id:${req.user.userId}`);

  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user.userId,
    });

    // whenever a new subscription is created -worflow will be activated
    const worflowRunId = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });
    console.log("Workflow triggered with run ID:", worflowRunId);
    console.log("Triggering workflow at:", `${SERVER_URL}/api/v1/workflows/subscription/reminder`);

    res.status(201).json({ success: true, data: subscription, worflowRunId });
  } catch (error) {
    console.log("Error creating subscription:", error.message);
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    console.log("Fetching subscription with ID:", req.params.id);
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    console.log(subscription.user.toString(), req.user.userId);

    if (subscription.user.toString() !== req.user.userId) {
      const error = new Error(
        "Access denied - not the owner of this subscription",
      );
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.params.id });
    if (subscriptions.length === 0) {
      const error = new Error("No subscriptions found for this user");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }
    if (subscription.user.toString() !== req.user.userId) {
      const error = new Error(
        "Access denied - not the owner of this subscription",
      );
      error.statusCode = 401;
      throw error;
    }
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.status(200).json({ success: true, data: updatedSubscription });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }
    if (subscription.user.toString() !== req.user.userId) {
      const error = new Error(
        "Access denied - not the owner of this subscription",
      );
      error.statusCode = 401;
      throw error;
    }
    subscription.status = "cancelled";
    await subscription.save();
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }
    if (subscription.user.toString() !== req.user.userId) {
      const error = new Error(
        "Access denied - not the owner of this subscription",
      );
      error.statusCode = 401;
      throw error;
    }
    await Subscription.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: "deleted successfully"});
  } catch (error) {
    next(error);
  }
};


export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const subscriptions = await Subscription.find({
      user: req.user.userId,
      renewalDate: { $gte: today, $lte: next30Days },
      status: "active",
    }).sort({ renewalDate: 1 });
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};
