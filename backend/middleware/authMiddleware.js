import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function authenticateToken (req, res, next) {

    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(401).json({error: "Token missing."});
    }

    jwt.verify(token, JWT_SECRET, (err, tokenPayload) => {
        if (err) {
            return res.status(403).json({error: "Invalid or expired token."});
        }
        req.user = tokenPayload;
        next();
    });
}

export default authenticateToken;