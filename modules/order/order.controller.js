import orderModel from "../../DB/models/order.model.js";
import { appError, asyncHandler } from "../../utils/globalError.js";
import productModel from "../../DB/models/product.model.js";
import couponModel from "../../DB/models/coupon.model.js";
import cartModel from "../../DB/models/cart.model.js";
import { createInvoice } from "../../utils/pdf.js";
import Stripe from "stripe";
import { payment } from "../../utils/payment.js";

//////////////////////////create order ////////////////////////
export const createOrder = asyncHandler(async (req, res, next) => {
    //>>>check coupon <<<<\\\
    const { products, couponName, phone, address, reason, paymentType } = req.body
    if (!req.body.products) {
        const cart = await cartModel.findOne({ userId: req.user._id })
        if (!cart?.products.length) {
            return next(new appError("cart empty ", 404))
        }
        req.body.isCart = true
        req.body.products = cart.products
    }
    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName, usedBy: { $nin: req.user._id } })
        if (!coupon || coupon.toDate < Date.now()) {
            return next(new appError("coupon not found or expired or used it before", 404))
        }
        req.body.coupon = coupon
    }
    //>>>check product <<<<\\\
    let finalProductList = [];
    let productIds = [];
    let subPrice = 0;
    for (let product of req.body.products) {
        const findProduct = await productModel.findOne({
            _id: product.productId, stock: { $gte: product.quantity }, isDeleted: false
        })
        if (!findProduct) {
            return next(new appError(`invalid product with id ${product.productId} `, 404))
        }
        if (req.body.isCart) {
            product = product.toObject()
        }
        product.name = findProduct.name
        product.unitPrice = findProduct.finalPrice
        product.finalPrice = product.quantity * findProduct.finalPrice
        finalProductList.push(product)
        productIds.push(product.productId)
        subPrice += product.finalPrice
    }
    const order = await orderModel.create({
        userId: req.user._id,
        phone,
        address,
        reason,
        products: finalProductList,
        couponId: req.body.coupon?._id,
        subPrice,
        totalPrice: subPrice - (subPrice * ((req.body.coupon?.amount || 0) / 100)),
        paymentType,
        status: paymentType == 'visa' ? 'waitPayment' : 'placed'
    })
    //>>>check product stock <<<<\\\
    for (const product of req.body.products) {
        await productModel.updateOne({ _id: product.productId },
            { $inc: { stock: -product.quantity } })
    }
    //>>>check coupon usedBy <<<<\\\
    if (req.body.coupon) {
        await couponModel.updateOne({ _id: req.body.coupon._id }, { $addToSet: { usedBy: req.user._id } })
    }
    //>>>check cart <<<<\\\
    if (req.body.isCart) {
        await cartModel.updateOne({ userId: req.user._id }, { products: [] })
    } else {
        await cartModel.updateOne({ userId: req.user._id },
            { $pull: { products: { productId: { $in: productIds } } } })
    }
    //generate pdf
    // const invoice = {
    //     shipping: {
    //         name: req.user.name,
    //         address: order.address,
    //         city: "egypt",
    //         state: "egypt",
    //         country: "EG",
    //         postal_code: 94111
    //     },
    //     items: products || cart.products,
    //     subPrice,
    //     totalPrice:order.totalPrice,
    //     invoice_nr: order._id,
    //     date:order.createdAt
    // };

    // await createInvoice(invoice, "invoice.pdf");

    //payment
    if (order.paymentType == 'card') {
        const stripe = new Stripe(process.env.STRIPE_KEY)
        if (req.body.coupon) {
            const coupon = await stripe.coupons.create({ percent_off: req.body.coupon.amount, duration: 'once' })
            req.body.couponId = coupon.id
        }
        const session = await payment({
            stripe,
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: req.user.email,
            metadata: {
                orderId: order._id.toString()
            },
            cancel_url: `${process.env.CANCEL_URL}?orderId=${order._id.toString()}`,
            line_items: order.products.map(product => {
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.name
                        },
                        unit_amount: product.unitPrice * 100 //convert from cent to dollar
                    },
                    quantity: product.quantity
                }
            }),
            discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : []
        })
        return res.status(201).json({ msg: "success", order, url: session.url, session })
    }
    res.status(201).json({ msg: "success", order })

})


export const cancelOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params
    const { reason } = req.body
    const order = await orderModel.findOne({ _id: orderId, userId: req.user._id })
    if (!order) {
        return next(new appError(`invalid product with id ${orderId} `, 404))
    }
    if ((order?.status != 'placed' && order?.paymentType == 'cash') || (order?.status != 'waitPayment' && order?.paymentType == 'visa')) {
        return next(new appError(`can not cancel your order `, 400))
    }
    const cancelOrder = await orderModel.updateOne({ _id: order._id }, { status: "cancel", updatedBy: req.user._id, reason })
    if (!cancelOrder) {
        return next(new appError(`fail when cancel order `, 400))
    }
    if (order.couponId) {
        await couponModel.updateOne({ _id: order.couponId }, { $pull: { usedBy: req.user._id } })
    }
    for (const product of order.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: product.quantity } })
    }
    res.status(201).json({ msg: "success", cancelOrder })

})


export const webhook = asyncHandler(async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_KEY)
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    const { orderId } = event.data.object.metadata
    if (event.type != "checkout.session.completed") {
        await orderModel.updateOne({ _id: orderId }, {status:"rejected"})
        return res.status(400).json({ msg: "rejected" })
    }
    await orderModel.updateOne({ _id: orderId }, {status:"placed"})
    return res.status(200).json({ msg: "Done" })
   
})