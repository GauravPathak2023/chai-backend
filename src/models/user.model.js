import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // If we want to make any field searchable make index: true, Expensive operation so use it carefully
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // Cloudinary url
        required: true
    },
    coverImage: {
        type: String, // cloudinary url
    },

    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    }],

    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }

}, {timestamps: true})

// Using pre hook. Hook can have these events -> validate, save, remove, updateOne, deleteOne, init
// We want password encryption before data save.
// Arrow fun. doesn't have the reference of this so we don't use it here
userSchema.pre('save', async function(next) {
    // We don't want password to be modified everytime when save the data. We only want to encrypt it when we password field is modified
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10) // 10 is salt/hash rounds
    next()
})

// Custom Methods
userSchema.methods.isPasswordCorrect = async function (password) {
    // bcrypt check if password is correct or not. so return true or false
    // compare takes 2 params -> string passsword, encrypted password
    return await bcrypt.compare(password, this.password)
}

// Methods for generating access and refresh token
userSchema.methods.generateAcessToken = function() {
    return jwt.sign(
        // Giving payload for signing token
        {
            // 'this' has the access to the store data
            _id: this._id, // we get it from mongodb
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        // Access token
        process.env.ACESSS_TOKEN_SECRET,
        {   // Expiry of access token
            expiresIn : process.env.ACESS_TOKEN_EXPIRY
        }
    )
}

// Refresh token has lesser information otherwise it will be as access token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign (
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema)