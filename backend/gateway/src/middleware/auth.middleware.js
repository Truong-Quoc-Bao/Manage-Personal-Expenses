const jwt = require("jsonwebtoken");

function authenticationMiddleware(req, res, next) {
    if (req.method === "OPTIONS") {
        return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const secretKey = process.env.JWT_KEY || process.env.JWT_SECRET;
    if (!secretKey) {
        console.error("Gateway auth: JWT_KEY or JWT_SECRET is not set");
        return res.status(500).json({ message: "Authentication is not configured" });
    }

    const verifyOptions = {};
    if (process.env.JWT_ISSUER) {
        verifyOptions.issuer = process.env.JWT_ISSUER;
    }
    if (process.env.JWT_AUDIENCE) {
        verifyOptions.audience = process.env.JWT_AUDIENCE;
    }

    try {
        const decoded = jwt.verify(token, secretKey, verifyOptions);
        // Auth service (TokenService) emits `user_id`; align with downstream e.g. X-User-Id on transaction proxy.
        const resolvedId =
            decoded.user_id ?? decoded.userId ?? decoded.sub;
        if (resolvedId != null && resolvedId !== "") {
            decoded.userId = String(resolvedId);
        }
        console.log(decoded);
        req.user = decoded;
        req.headers['x-user-id'] = String(resolvedId);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

const PUBLIC_AUTH_RELATIVE_PATHS = new Set([
    "/login",
    "/register",
    "/health",
    "/forgot-password",
    "/reset-password",
]);

function authenticationMiddlewareExceptPublicAuthRoutes(req, res, next) {
    if (req.method === "OPTIONS") {
        return next();
    }
    if (PUBLIC_AUTH_RELATIVE_PATHS.has(req.path)) {
        return next();
    }
    return authenticationMiddleware(req, res, next);
}

module.exports = authenticationMiddleware;
module.exports.authenticationMiddlewareExceptPublicAuthRoutes =
    authenticationMiddlewareExceptPublicAuthRoutes;
module.exports.PUBLIC_AUTH_RELATIVE_PATHS = PUBLIC_AUTH_RELATIVE_PATHS;