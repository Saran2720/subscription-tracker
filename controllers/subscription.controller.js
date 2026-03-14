import Subscription from '../models/subscription.model.js'

export const createSubscription = async (req, res, next) => {

    console.log(`user id:${req.body.userId}`);

    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user.userId
        });

        res.status(201).json({ success: true, data: subscription })

    } catch (error) {
        next(error);
    }
}