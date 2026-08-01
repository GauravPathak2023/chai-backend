import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB Connected !! DB HOST: ${connectionInstance}`)
    } catch (error) {
        console.log("MONGODB connection error")
        // process is the referece of our current application
        process.exit(1) // process exit has different exit codes
    }
}

export default connectDB