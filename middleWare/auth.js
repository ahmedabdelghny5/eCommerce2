import jwt from 'jsonwebtoken'
import { appError, asyncHandler } from '../utils/globalError.js'
import userModel from '../DB/models/user.model.js'

export const role = {
    user: 'User',
    admin: "Admin"
}

export const auth = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {
        const { auth } = req.headers
        if (!auth) { return next(new appError("Missing Authorization header ", 404)) }
        if (!auth.startsWith(process.env.secretKey)) { return next(new appError("invalid Authorization header")) }
        const token = auth.split(process.env.secretKey)[1]
        const decoded = jwt.verify(token, process.env.signature)
        if (!decoded?.id) {
            return next(new appError("invalid token payload", 400))
        }
        const user = await userModel.findById(decoded.id)
        if (!user) {
            return next(new appError('user not found', 404))
        }
        if (parseInt(user.changePasswordAt?.getTime() / 1000) > decoded.iat) {
            return next(new appError('expire token', 403))
        }
        if (!accessRoles.includes(user.role)) {
            return next(new appError('you are not authorized', 403))
        }
        req.user = user
        next()
    })
}