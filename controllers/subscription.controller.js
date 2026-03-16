import { workflowClient } from '../config/upstash.js';
import Subscription from '../models/subscription.model.js'
import {SERVER_URL} from  '../config/env.js'

export const createSubscription = async (req, res, next) => {

    console.log(`user id:${req.body.userId}`);

    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user.userId
        });

        //whenever a new subscription is created -worflow will be activated
        await workflowClient.trigger({
            url: `${SERVER_URL}`,
        })

        res.status(201).json({ success: true, data: subscription })

    } catch (error) {
        next(error);
    }
}

export const getUserSubscription = async (req, res, next) => {
    try {
        console.log('req.params:', req.params)

        if (req.user.userId !== req.params.id) {
            const error = new Error("You not the ower of the account - access denied")
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.user.userId });

        res.status(200).json({ success: true, data: subscriptions })

    } catch (error) {
        next(error);
    }
}