import {asyncHandler} from '../utils/asyncHandler.js'
import{ApiError} from "../utils/apiError.js"
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"

// Async Handler is a higher order function that takes function as input
const registerUser = asyncHandler(async (req,res) => {
   // get user details from frontend -> Data through postman
   // Validation on user's detail -> Not empty
   // check if user already exists: check username or email
   // check for images, check for avatar
   // upload them to cloudinary
   // create user object -> create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return response

   const {fullName, email, username, password} = req.body
   console.log("email", email)

   // Use if-else for every variable
//    if(fullName==="")
//         throw new ApiError(400,"Full Name is required")
    // VALIDATION
    if (
        [fullName, email, username, password].some((field) => field?.trim()=== "") // field hai toh trim kro if empty hai toh return true
    ) {
        throw new ApiError(400,`${field} is required`)
    }

    // We search if username or email exists in mongodb or not
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    // If user exist then he/she can't register
    if(existedUser) 
        throw new ApiError(409, "User with email or username already exists")

    // Middleware adds fields in request. req.body is default from express so multer gives us req.files
    const avatarLocalPath = req.files?.avatar[0]?.path; // We may or may not have the access so use ? (means optional)

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // Checking for avatar
    if(!avatarLocalPath)
        throw new ApiError(400, "Avatar file is required")

    // Upload avatar and coverimage to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath) // Uploading take time so make it async
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar) 
        throw new ApiError(400,"Avatar file is req.")

    // Storing data to DataBase
    const user = await User.create({
        fullName,
        avatar: avatar.url, // cloudinary will return many things but we will store the url of image on our database
        coverImage: coverImage?.url || "", // if cover image not present than store it empty
        email,
        password,
        username: username.toLowerCase()
    })
    // Verifying if data is stored in mongodb or not
    // select() -> It allows us to reject those fields which we don't want to show (we don't want to show password and refresh token)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser)
        throw new ApiError(500, "Something went wrong while registering the user")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    
}) 

export {registerUser}