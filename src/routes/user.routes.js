import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
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

export default router 