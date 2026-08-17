import {asyncHandler} from '../utils/asyncHandler.js'
import{ApiError} from "../utils/apiError.js"
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // Refresh tokens are saved in database
        user.refreshToken = refreshToken
        // if we use just save() then we have to give password, etc (all mandatory fields) hence we don't want validation here
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        console.log("TOKEN GENERATION ERROR:", error)
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


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
//    console.log("email", email)

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
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // If user exist then he/she can't register
    if(existedUser) 
        throw new ApiError(409, "User with email or username already exists")

    // Middleware adds fields in request. req.body is default from express so multer gives us req.files
    //const avatarLocalPath = req.files?.avatar[0]?.path; // We may or may not have the access so use ? (means optional)

    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // Checking for cover image 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


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


// User Login
const loginUser = asyncHandler( async (req,res) => {
    // take data from req body
    // username or email base access (kiske base pe login karwana hai)
    // find the user, if exists
    // check password
    // access and refresh token
    // send cookie (We send tokens in cookies)
    
    const {email, username, password} = req.body
    // We want atleast one of them
    if(!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // Find email or username (anyone)
    const user = await User.findOne({
        $or : [{ username }, { email }]
    })

    // If we didn't get user -> User dosen't exist
    if(!user)
        throw new ApiError(404, "User does not exist")

    // Check password if user exist
    // We defined isPasswordCorrect() inside the user.model.js
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid)
        throw new ApiError(401,"Invalid user credentials")

    // generate access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // Refresh token of user got updated but we have older reference where refresh token is empty
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // send cookie
    // By default anyone can modify cookie in frontend. but by doing below thing cookie will be modifiable from server only 
    const options = {
        httpOnly: true,
        secure: true
    }

    // We can set as many cookies we want
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            // We are sending access and refresh token, incase user may need it (ex. too store in local storage)
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully"
    )
    )
})

// Log Out user -> We are logging out the user
const logoutUser = asyncHandler(async (req,res) => {
    // Clear cookies and remove refresh token from database
    // Now we have access to req.user -> We added this using auth.middleware
    // Using id we will make refresh token undefined
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true // In returned response we will get new updated value
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged out"))
})

// Making endpoint for refresh token -> Which will be used by frontend to give access token to user without the need of logging
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Accessing refresh token using cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // We didn't get the refresh token
    if(incomingRefreshToken)
        throw new ApiError(401, "unauthorized request")

    // decoding refresh token
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if(!user)
            throw new ApiError(401, "Invalid refresh token")
    
        if(incomingRefreshToken !== user?.refreshToken)
            throw new ApiError(401, "Refresh token is expired or used")
    
        // We generate new access and refresh token
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        
        return res.status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken
}