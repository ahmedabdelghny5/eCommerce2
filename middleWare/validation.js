import Joi from "joi"
import { Types } from "mongoose"

const validationObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("invalid object _id")
}

export const generalFiled = {
    email: Joi.string().email({ tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().required().min(4).max(30),
    rePassword: Joi.string().valid(Joi.ref('password')).required(),
    id: Joi.string().custom(validationObjectId).required(),
    file: Joi.object({
        size: Joi.number().positive().required(),
        path: Joi.string().required(),
        filename: Joi.string().required(),
        destination: Joi.string().required(),
        mimetype: Joi.string().required(),
        encoding: Joi.string().required(),
        originalname: Joi.string().required(),
        fieldname: Joi.string().required()
    })
}

export const validate = (schema) => {
    return (req, res, next) => {
        const keys = { ...req.body, ...req.query, ...req.params }
        if (req.file || req.files) {
            keys.file = req.file || req.files
        }
        const { error } = schema.validate(keys, { abortEarly: false })
        if (error?.details) {
            return res.status(400).json({ msg: "validation error", error: error.details })
        }
        next()
    }
}