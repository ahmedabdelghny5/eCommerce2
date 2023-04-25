import { Router } from "express";
import * as CouponC from "./coupon.controller.js"
import { multerValidation, myMulterCloud } from "../../utils/multer.js";
import { auth, role } from '../../middleWare/auth.js'
import { validate } from "../../middleWare/validation.js";
import * as BV from "./couponValidation.js";
const router = Router()

router.post("/", auth([role.admin, role.user]),validate(BV.CreateCouponValidate), CouponC.createCoupon)
router.put("/:couponId", auth([role.admin, role.user]),validate(BV.updateCouponValidate), CouponC.updateCoupon)


export default router