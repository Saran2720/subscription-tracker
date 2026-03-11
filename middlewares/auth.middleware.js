import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const authorize = async (req, res, next) => {
    try {

        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({ success: false, message: 'Access Denied' });
        }

        const verified = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(verified.userId);

        if (!user) {
            res.status(401).json({ success: false, message: 'Unauthorized access' });
        }

        // checking the ownership
        const authenticatedUserId = verified.userId;
        const requestedProfileId = req.params.id;
        if (authenticatedUserId != requestedProfileId) {
            res.status(403).json({
                success: false,
                message: 'Forbidden Access'
            })
        }

        req.user = verified;
        next();

    } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized', error: error.message });
    }
}

export default authorize;