
import Joi from "joi"
import { generalFiled } from "../../middleWare/validation.js"


export const CreateBrandValidate=Joi.object({ 
    name:Joi.string().min(2).max(50).required(),
    file: generalFiled.file.required(),
}).required()
