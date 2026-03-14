import aj from "../config/arcject.js";


const arcjectMiddleware = async (req, res, next) => {

    // Skip bot detection for auth routes
    if (req.path.startsWith('/api/v1/auth')) {
        return next();
    }

    try {

        const userAgent = req.headers["user-agent"];

        // Allow Postman during development
        if (userAgent && userAgent.includes("Postman")) {
            return next();
        }

        const decision = await aj.protect(req,{requested:1});

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) return res.status(429).json({ error: 'Rate limit exceed' });

            if (decision.reason.isBot()) {
                console.log("BOT BLOCKED:", { ip: req.ip, userAgent });

                return res.status(403).json({ error: "Bot detected" });

            }

            return res.status(403).json({ error: "Access Denied" });
        }
        next();

    } catch (error) {
        console.log(`Arcject middleware error: ${error}`);
        next(error);
    }
}

export default arcjectMiddleware;