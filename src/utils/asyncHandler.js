// In production grade code, This is preferred over try-catch one
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}

// Higher Order fun. can accept function as parameter 
// It is a wrapper function which take a function and just execute it 
// It is a try-catch way => we can also do it using promises
/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req,res,next);
    } catch(error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
*/