
import Joi from "joi"
import { generalFiled } from "../../middleWare/validation.js"


export const create = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().required(),
    size: Joi.array(),
    colors: Joi.array(),
    price: Joi.number().positive().required(),
    discount: Joi.number().positive().min(1).max(100),
    finalPrice: Joi.number().positive(),
    stock: Joi.number().positive().integer(),
    amount: Joi.number().positive().integer().required(),
    soldItems: Joi.number().positive().integer(),
    brandId: generalFiled.id.required(),
    categoryId: generalFiled.id.required(),
    subCategoryId: generalFiled.id.required(),
    file: Joi.object({
        mainImage: Joi.array().items(generalFiled.file.required()).required(),
        subImages: Joi.array().items(generalFiled.file.required()).min(1).max(5).optional(),
    }).required()
}).required()
