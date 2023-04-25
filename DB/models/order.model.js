import { Types, Schema, model } from "mongoose";

const orderSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: [true, "name is required"],
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: "User",
    },
    couponId: {
        type: Types.ObjectId,
        ref: "Coupon",
    },
    products: [{
        name: { type: String, required: true },
        productId: { type: Types.ObjectId, ref: "Product", },
        quantity: { type: Number, default: 1, required: true },
        unitPrice: { type: Number, default: 1, required: true },
        finalPrice: { type: Number, default: 1, required: true },
    }],
    note: String,
    phone: [{ type: String, required: true }],
    address: [{ type: String, required: true }],
    subPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paymentType: { type: String, default: "cash", enum: ['cash', 'card'] },
    status: {
        type: String,
        required: true,
        default: "placed",
        enum: ['placed', 'onWay', 'waitPayment', 'cancel', 'rejected', 'delivered']
    },
    reason: String
}, {
    timestamps: true
})

const orderModel = model('Order', orderSchema)
export default orderModel