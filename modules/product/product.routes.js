import { Router } from "express";
import * as PC from "./product.controller.js"
import { multerValidation, myMulterCloud } from "../../utils/multer.js";
import { auth, role } from '../../middleWare/auth.js'
import { validate } from "../../middleWare/validation.js";
import { create } from "./productValidation.js";
import review from "../review/review.routes.js"
const router = Router()

router.use('/:productId/reviews', review)

router.post("/", auth(Object.values(role)), myMulterCloud(multerValidation.image).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 }
]),validate(create), PC.createProduct)   //>>>validation not working yet///

router.put("/:productId", auth(Object.values(role)), myMulterCloud(multerValidation.image).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 }
]), PC.updateProduct)

router.patch("/:productId", PC.addToWishList)
router.patch("/:productId", PC.removeFromWishList)
router.get("/", PC.getProducts)


export default router