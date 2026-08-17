import {Router} from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

// url would be http://localhost:3000/api/v1/users/register
router.route("/register").post(
    // Adding the middleware -> Before registering user we want to save image data in cloudinary
    upload.fields([
        // We want 2 files: avatar and cover image so 2 objects
        {
            name: "avatar",
            maxCount:1  // no. of files we want
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]) ,
    registerUser
)

router.route("/login").post(loginUser)
// Chatgpt code to test /login
// router.post("/login", (req, res) => {
//     res.status(200).json({
//         message: "LOGIN ROUTE IS WORKING"
//     })
// })

// secured routes
// Here we inject middleware verifyJWT. next() is written at last inside the middleware so that after it logoutUser() get executed. 
// We can write as much middleware we want in b/w 
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router 