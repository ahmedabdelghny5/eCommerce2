import { Router } from "express";
import * as SC from "./subCategory.controller.js"
import { multerValidation, myMulterCloud } from "../../utils/multer.js";
import { auth, role } from '../../middleWare/auth.js'
import { validate } from "../../middleWare/validation.js";
import * as SCV from "./subCategoryValidation.js";
const router = Router({ mergeParams: true })

router.post("/", auth([role.admin, role.user]), myMulterCloud(multerValidation.image).single('image'),
    validate(SCV.CreateSubCategoryValidate), SC.createSubCategory)
router.put("/:subCategoryId", auth([role.admin, role.user]), myMulterCloud(multerValidation.image).single('image'), SC.updateSubCategory)


export default router