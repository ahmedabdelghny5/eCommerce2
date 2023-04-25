import { Types, Schema, model } from "mongoose";

const cartSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: [true, "name is required"],
        unique: [true, "name is unique"],
    },
    products: [{
        productId: { type: Types.ObjectId, ref: "Product", },
        quantity: { type: Number, default: 1, required: true }
    }],

}, {
    timestamps: true
})

const cartModel = model('Cart', cartSchema)
export default cartModel