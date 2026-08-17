// Middleware for user logout

import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

// Here "res" is not used so instead use _
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // req has cookie access -> which was given using middleware cookieParser()
        // access token may come from custom header also
        // In postman: In Headers, Key: Authorization and Value: Bearer <Token>
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token)
            throw new ApiError(401, "Unauthorized request")
    
        // Decoding info inside token. To decode we need secret key. Inside our access token we have id, email, username and fullname
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user)
            throw new ApiError(401, "Invalid Acess Token")
    
        req.user = user // adding new object "user" to our request
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})