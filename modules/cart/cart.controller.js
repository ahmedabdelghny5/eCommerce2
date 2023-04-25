import cartModel from "../../DB/models/cart.model.js";
import { appError, asyncHandler } from "../../utils/globalError.js";
import productModel from "../../DB/models/product.model.js";


////////////////////////// create cart ////////////////////////
export const createCart = asyncHandler(async (req, res, next) => {
    //>>>check product <<<<\\\
    const { productId, quantity } = req.body
    const product = await productModel.findById({ _id: productId })
    if (!product) {
        return next(new appError("product not found", 404))
    }
    if (product.stock < quantity || product.isDeleted) {
        await productModel.updateOne({ _id: productId }, { $addToSet: { wishList: req.user._id } })
        return next(new appError(`invalid quantity available is ${product.stock}`, 404))
    }
    //>>>check cart if not found then create it <<<<\\\
    const cart = await cartModel.findOne({ userId: req.user._id })
    if (!cart) {
        const newCart = await cartModel.create({
            userId: req.user._id,
            products: [{ productId, quantity }]
        })
        return res.status(201).json({ msg: "success", newCart })
    }
    //>>>check cart if  found then update old item <<<<\\\
    let match = false
    for (let i = 0; i < cart.products.length; i++) {
        if (cart.products[i].productId.toString() == productId) {
            cart.products[i].quantity = quantity
            match = true
            break;
        }
    }
    //>>>check cart if  found then push new item <<<<\\\
    if (!match) {
        cart.products.push({ productId, quantity })
    }
    await cart.save()
    return res.status(201).json({ msg: "success", cart })
})

////////////////////////// remove cart ////////////////////////
export const removeCart = asyncHandler(async (req, res, next) => {
    const { productIds } = req.body
    const cart = await cartModel.updateOne({ userId: req.user._id },
        { $pull: { products: { productId: { $in: productIds } } } })
    cart.modifiedCount ? res.status(200).json({ msg: "remove" }) : next(new appError("fail or not owner", 500))
})

////////////////////////// clear cart ////////////////////////
export const clearCart = asyncHandler(async (req, res, next) => {
    const cart = await cartModel.updateOne({ userId: req.user._id }, { products: [] })
    cart.modifiedCount ? res.status(200).json({ msg: "clear" }) : next(new appError("fail or not owner", 500))
})
