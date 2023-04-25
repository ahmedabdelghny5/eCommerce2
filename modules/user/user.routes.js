import { Router } from "express";
import * as UC from "./user.controller.js"
import { multerValidation, myMulterCloud } from "../../utils/multer.js";
import { validate } from "../../middleWare/validation.js";
import * as UV from "./userValidation.js";
const router = Router()


router.post("/signUp", myMulterCloud(multerValidation.image).single('image'), validate(UV.signUpValidate), UC.signUp)
router.get("/confirmEmail/:token",validate(UV.tokenValidate), UC.confirmEmail)
router.get("/refreshToken/:token",validate(UV.tokenValidate), UC.refreshToken)
router.patch('/forgetPassword',UC.forgetPassword)
router.patch('/resetPassword/:token',validate(UV.resetPasswordValidate),UC.resetPassword)
router.post("/signIn", validate(UV.signInValidate), UC.signIn)



export default router