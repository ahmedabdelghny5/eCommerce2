import { Router } from "express";
import * as BC from "./brand.controller.js"
import { multerValidation, myMulterCloud } from "../../utils/multer.js";
import { auth, role } from '../../middleWare/auth.js'
import { validate } from "../../middleWare/validation.js";
import * as BV from "./brandValidation.js";
const router = Router()

router.post("/", auth([role.admin, role.user]), myMulterCloud(multerValidation.image).single('image'),
    validate(BV.CreateBrandValidate), BC.createBrand)
router.put("/:brandId", auth([role.admin, role.user]),
    myMulterCloud(multerValidation.image).single('image'), BC.updateBrand)


export default router