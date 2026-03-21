import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  deleteSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  getUserSubscriptions,
  getUpcomingRenewals
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

//user id
subscriptionRouter.get("/user/:id/upcoming-renewals", authorize, getUpcomingRenewals);
subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

//subscription id
subscriptionRouter.get("/:id", authorize, getSubscription);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id", authorize, updateSubscription);

subscriptionRouter.delete("/:id", authorize, deleteSubscription);

subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);

export default subscriptionRouter;
