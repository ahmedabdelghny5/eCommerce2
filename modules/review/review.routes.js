import { Router } from "express";
import * as RC from "./review.controller.js"
import { auth, role } from '../../middleWare/auth.js'
import { validate } from "../../middleWare/validation.js";
import * as RV from "./reviewValidation.js";
const router = Router({ mergeParams: true });

router.post("/", auth([role.user]), validate(RV.CreateReviewValidate), RC.createReview)
router.put("/:reviewId", auth([role.user]), validate(RV.updateReviewValidate), RC.updateReview)


export default router