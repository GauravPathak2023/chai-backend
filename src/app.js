import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// The cors package is a Node.js middleware used to enable and configure Cross-Origin Resource Sharing (CORS) on a backend server. It injects specific HTTP headers into server responses, instructing web browsers to allow front-end applications running on a different domain to securely access your API resources
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


// We will accept json
app.use(express.json({
    limit: "16kb" // Only upto 16kb of json will be accepted
}))

// We will accept data from URL -> URL data will be in different format. so url encoder needed
app.use(express.urlencoded({
    extended: true, // We can give objects inside object. We won't be using it mostly so not needed
    limit: "16kb"
}))

// We want to store files like pdf, images etc in public folder
app.use(express.static("public"))

// Cookie parser -> We can access and set cookies inside users browser, basically we can perform CRUD operation
app.use(cookieParser())

// routes import
import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter)

// Chatgpt code
// console.log(
//     userRouter.stack.map(route => ({
//         path: route.route?.path,
//         methods: route.route?.methods
//     }))
// );

export {app}