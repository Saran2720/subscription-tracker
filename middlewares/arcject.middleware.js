import aj from "../config/arcject.js";


const arcjectMiddleware = async (req, res, next) => {

    if(req.path.startsWith('/api/v1/auth')){
        next();
    }

    try {
        const userAgent = req.headers["user-agent"];

        const decision = await aj.protect(req, { requested: 1 });
        // console.log("Arcjet decison:", decision);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) return res.status(429).json({ error: 'Rate limit exceed' });

            if (decision.reason.isBot()) {
                // if (userAgent && userAgent.includes("Postman")) {
                //     return next();
                // }
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