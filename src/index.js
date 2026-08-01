// require('dotenv').config({path: './env'})
import dotenv from "dotenv"

import express from "express"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running at port ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGO DB connections failed ",err)
})









/* 1st Approach to connect to DB
const app = express()
// iffy -> immediatley invoked function expression -> JS function that runs as soon as it is defined
// Put ; -> it's professional approach -> If ; is missing in previous line of code than iffy may give problem
;( async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       // To tell if express app has some error
       app.on("error", (error) => {
            // 
            console.log("Application is not able to talk to the database", error)
            throw error
       })

       app.listen(process.env.PORT, () => {
            console.log("App is listening at ", process.env.PORT)
       })
    } catch(error) {
        console.error("Error: ",error)
        throw error
    }
})()
*/