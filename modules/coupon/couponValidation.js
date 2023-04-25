
import Joi from 'joi';
// import JoiDate from '@joi/date';
// const Joi = BaseJoi.extend(JoiDate);
import { generalFiled } from "../../middleWare/validation.js"


export const CreateCouponValidate = Joi.object({
    name: Joi.string().min(2).max(10).required(),
    amount: Joi.number().positive().min(1).max(100).required(),
    fromDate: Joi.string().required(),
    toDate: Joi.string().required(),
    file: generalFiled.file.optional(),
}).required()

export const updateCouponValidate = Joi.object({
    name: Joi.string().min(2).max(10).required(),
    amount: Joi.number().positive().min(1).max(100).required(),
    fromDate: Joi.string().required(),
    toDate: Joi.string().required(),
    file: generalFiled.file.optional(),
    couponId: generalFiled.id.required(),
}).required()
