import express from 'express';
import { PORT } from './config/env.js';

import userRouter from './routes/user.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import authRouter from './routes/auth.routes.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleWare from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjectMiddleware from './middlewares/arcject.middleware.js';
import workflowRouter from './routes/worFlow.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false})); //used to parse data sent from HTML forms // convert into object
app.use(cookieParser());// reads cookie from incomming req
app.use(arcjectMiddleware)

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);


app.use(errorMiddleWare);

app.listen(PORT, async () => {
    console.log(`server is running on http://localhost:${PORT}`);

    await connectToDatabase();
})

export default app;
