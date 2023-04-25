import { Router } from "express";
import * as CC from "./category.controller.js"
import { multerValidation, myMulterCloud } from "../../utils/multer.js";
import { auth, role } from '../../middleWare/auth.js'
import subcategory from '../subCategory/subCategory.routes.js'
import { validate } from "../../middleWare/validation.js";
import * as CV from "./categoryValidation.js";
const router = Router()

router.use('/:categoryId/subCategory', subcategory)

router.post("/", auth([role.admin, role.user]), myMulterCloud(multerValidation.image).single('image'),
    validate(CV.createCategoryValidate), CC.createCategory)
router.put("/:categoryId", auth([role.admin, role.user]),
    myMulterCloud(multerValidation.image).single('image'), CC.updateCategory)
router.get("/", auth(Object.values(role)), CC.getAllCategories)


export default router