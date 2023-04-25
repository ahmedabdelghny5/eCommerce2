
import Joi from "joi"
import { generalFiled } from "../../middleWare/validation.js"


export const CreateSubCategoryValidate=Joi.object({ 
    name:Joi.string().min(2).max(50).required(),
    categoryId:Joi.string().min(20).required(),
    file: generalFiled.file.required(),
}).required()
