import { Router } from "express";
import * as OC from "./order.controller.js"
import { auth, role } from '../../middleWare/auth.js'
import { validate } from "../../middleWare/validation.js";
import express from "express";
const router = Router()

router.post("/", auth([role.admin, role.user]), OC.createOrder)
router.patch("/:orderId", auth([role.user]), OC.cancelOrder)
router.post('/webhook', express.raw({type: 'application/json'}),OC.webhook);
  


export default router