import express from "express";
import { PORT } from "./config/env.js";

import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import authRouter from "./routes/auth.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleWare from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import arcjectMiddleware from "./middlewares/arcject.middleware.js";
import { serve } from "@upstash/workflow/express";
import sendReminder from "./controllers/workFlow.controller.js";

const app = express();
app.set("trust proxy", true); // trust first proxy, needed for correct IP detection behind proxies/load balancers
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //used to parse data sent from HTML forms // convert into object
app.use(cookieParser()); // reads cookie from incomming req
app.use(arcjectMiddleware);

//health check route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.post("/api/v1/workflows/subscription/reminder", serve(sendReminder));

app.use(errorMiddleWare);

app.listen(PORT, async () => {
  console.log(`server is running on http://localhost:${PORT}`);

  await connectToDatabase();
});

export default app;
