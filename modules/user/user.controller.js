import userModel from "../../DB/models/user.model.js";
import { appError, asyncHandler } from "../../utils/globalError.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { emailFunction } from "../../utils/sendEmail.js";
import cloudinary from "../../utils/cloudinary.js";
import { nanoid } from 'nanoid'
/////////////////////////////// signUp///////////////////////////////////
export const signUp = asyncHandler(async (req, res, next) => {
    const { name, email, password, rePassword, age, phone } = req.body
    const exist = await userModel.findOne({ email })
    if (exist) {
        return next(new appError("User already exists", 400))
    }
    const hash = bcrypt.hashSync(password, +process.env.saltOrRounds)
    const user = new userModel({ name, email, password: hash, rePassword, age, phone })
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.signature)
    const link = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/users/confirmEmail/${token}`
    const rfToken = jwt.sign({ email: user.email, id: user._id }, process.env.signature)
    const rfLink = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/users/refreshToken/${rfToken}`
    const info = await emailFunction(user.email, "confirmEmail", `<a href='${link}'>confirm email</a> <br>
    <a href='${rfLink}'>refreshToken</a> `)
    if (info?.accepted?.length > 0) {
        if (req.file) {
            const customId = nanoid(4)
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: `eCommerce/user/${customId}`
            })
            user.image = secure_url
            user.publicId = public_id
            user.customId = customId
        }
        const savedUser = await user.save()
        return res.status(201).json({ msg: "success", user: savedUser })
    } else {
        return next(new appError("email rejected", 400))
    }

})

/////////////////////////////// confirmEmail///////////////////////////////////

export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    if (!token) {
        return next(new appError("invalid token", 400))
    }
    const decoded = jwt.verify(token, process.env.signature)
    if (!decoded?.id) {
        return next(new appError("invalid token payload", 400))
    }
    const user = await userModel.findOneAndUpdate({ _id: decoded.id, confirmed: false }, { confirmed: true }, { new: true })
    user ? res.status(200).json({ msg: "success plz log in" }) : next(new appError("fail or already confirmed", 500))
})

/////////////////////////////// refreshToken///////////////////////////////////

export const refreshToken = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    if (!token) {
        return next(new appError("invalid token", 400))
    }
    const decoded = jwt.verify(token, process.env.signature)
    if (!decoded?.id) {
        return next(new appError("invalid token payload", 400))
    }
    const user = await userModel.findById({ _id: decoded.id })
    if (!user) {
        return next(new appError("user not found", 400))
    }
    if (user.confirmed == true) { return next(new appError("email already confirmed plz log in", 402)) }
    const reToken = jwt.sign({ email: user.email, id: user._id }, process.env.signature, { expiresIn: 60 * 10 })
    const link = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/users/confirmEmail/${reToken}`
    const info = await emailFunction(user.email, "confirm email", `<a href='${link}'>confirm email</a>`)
    if (info?.accepted?.length > 0) {
        return res.status(200).json({ msg: "success confirm email plz " })
    } else {
        return next(new appError("email rejected", 400))
    }
})
/////////////////////////////// forgetPassword///////////////////////////////////

export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    if (!user) return next(new appError("user not found", 400))
    const code = nanoid(4)
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.signature)
    const link = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/users/resetPassword/${token}`

    const info = await emailFunction(email, 'verify password', `<a href='${link}'>verify password</a> <br><p>your code:${code}</p>`)
    if (!info?.accepted?.length > 0) {
        return next(new appError("email rejected", 400))
    }
    const sendCode = await userModel.findOneAndUpdate({ email }, { code }, { new: true })
    sendCode ? res.status(200).json({ msg: " success", code, link }) : next(new appError("fail", 500))

})

/////////////////////////////// resetPassword///////////////////////////////////
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    const { code, newPassword } = req.body
    const decoded = jwt.verify(token, process.env.signature)
    if (!decoded) {
        return next(new appError("invalid token", 400))
    } else {
        const user = await userModel.findById({ _id: decoded.id })
        if (!user) return next(new appError("user not found", 404))
        if (user.code !== code || code == '') {
            return next(new appError("invalid code", 401))
        } else {
            const hashPassword = bcrypt.hashSync(newPassword, +process.env.saltOrRounds)
            user.password = hashPassword
            user.changePasswordAt = Date.now()
            user.code = ''
            user.save()
            return res.status(200).json({ msg: "success" })
        }
    }
});
/////////////////////////////// signIn///////////////////////////////////

export const signIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    const exist = await userModel.findOne({ email })
    if (!exist) {
        return next(new appError("User not exist", 404))
    }
    const match = bcrypt.compareSync(password, exist.password)
    if (!match) { return next(new appError("password not match", 402)) }
    if (!exist.confirmed) {
        return next(new appError("email not confirmed yet", 400))
    }
    const token = jwt.sign({ email: exist.email, id: exist._id }, process.env.signature)
    const user = await userModel.updateOne({ email }, { active: true })
    user.modifiedCount ? res.status(200).json({ msg: "success ", token }) : next(new appError("fail", 500))

})