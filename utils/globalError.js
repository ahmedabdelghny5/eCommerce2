export class appError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            next(err);
        })
    }
}



export const globalErrorHandler = (err, req, res, next) => {
    if (process.env.MOOD == 'DEV') {
        devMode(err,res)
    } else {
        prodMode(err,res)
    }
}

const prodMode = (err, res) => {
    let code = err.statusCode || 500
    res.status(code).json({
        error: err.message,
        statusCode: code,
    })
}
const devMode = (err, res) => {
    let code = err.statusCode || 500
    res.status(code).json({
        error: err.message,
        statusCode: code,
        stack: err.stack
    })
}