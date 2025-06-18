import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

export const verifyAuthToken = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token is required" })
        }

        const decodecToken = jwt.verify(token, process.env.JWT_SECRET_ACCESS)

        const user = await User.findById(decodecToken.userId).select("-password -accessToken")

        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }

        req.user = user
        next()

    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" })
    }
}
