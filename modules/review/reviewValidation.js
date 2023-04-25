
import Joi from "joi"
import { generalFiled } from "../../middleWare/validation.js"


export const CreateReviewValidate = Joi.object({
    comment: Joi.string().min(2).max(15000).required(),
    rating: Joi.number().positive().min(1).max(5).required(),
    productId: generalFiled.id.required()
}).required()

export const updateReviewValidate = Joi.object({
    comment: Joi.string().min(2).max(15000).required(),
    rating: Joi.number().positive().min(1).max(5).required(),
    productId: generalFiled.id.required(),
    reviewId: generalFiled.id.required()
}).required()
