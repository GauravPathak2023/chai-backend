// File is on local server so we give its path so that it will be uploaded to cloudinary
// When files uploaded we will remove them from local server

import { v2 as cloudinary } from 'cloudinary';
import fs from "fs" // fs is file system we get it in node.js so no need to install it. Help in file handling

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // we can give diff. options inside these braces
        })
        // File has been uploaded successfully
        console.log("File is uploaded on cloudinary", response.url)

        return response
    } catch(error) {
        fs.unlinkSync(localFilePath) // Remove the locally saved temporary file as the upload operation got failed

        return null
    }
}

export {uploadOnCloudinary}