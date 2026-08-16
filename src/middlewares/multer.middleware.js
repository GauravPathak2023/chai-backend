import multer from "multer"

const storage = multer.diskStorage({
    // cb -> callback
    destination: function(req,file, cb) {
        cb(null, './public/temp') // here we will keep our files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

// Exporting
export const upload = multer({
    storage : storage
})