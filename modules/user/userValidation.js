import Joi from 'joi'
import { generalFiled } from '../../middleWare/validation.js'


export const signUpValidate=Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email:generalFiled.email,
        phone: Joi.string().required(),
        age: Joi.string().required(),
        password: generalFiled.password,
        rePassword: generalFiled.rePassword,
        file:generalFiled.file
        // file:Joi.array().items(generalFiled.file.required()).required()
}).required()

export const signInValidate=Joi.object({ 
        email:generalFiled.email,
        password: generalFiled.password,
}).required()

export const tokenValidate=Joi.object({ 
        token:Joi.string().required()
}).required()

export const resetPasswordValidate=Joi.object({ 
        token:Joi.string().required(),
        code:Joi.string().required(),
        newPassword: generalFiled.password,
}).required()