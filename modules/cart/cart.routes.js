import { Router } from "express";
import * as cartC from "./cart.controller.js"
import { multerValidation, myMulterCloud } from "../../utils/multer.js";
import { auth, role } from '../../middleWare/auth.js'
import { validate } from "../../middleWare/validation.js";
const router = Router()

router.post("/", auth([role.admin, role.user]), cartC.createCart)
router.patch("/remove", auth([role.user]), cartC.removeCart)
router.patch("/clear", auth([role.user]), cartC.clearCart)



export default router