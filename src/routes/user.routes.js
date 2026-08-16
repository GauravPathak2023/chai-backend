import {Router} from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"


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

// secured routes
// Here we inject middleware verifyJWT. next() is written at last inside the middleware so that after it logoutUser() get executed. 
// We can write as much middleware we want in b/w 
router.route("/logout").post(verfiyJWT, logoutUser)


export default router 