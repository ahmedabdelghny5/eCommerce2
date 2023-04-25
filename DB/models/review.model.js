import { Types, Schema, model } from "mongoose";

const reviewSchema = new Schema({
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: [true, "name is required"],
    },
    productId: { type: Types.ObjectId, ref: "Product", required: [true, "productId is required"] },
    orderId: { type: Types.ObjectId, ref: "Order", required: [true, "orderId is required"] },
}, {
    timestamps: true
})

const reviewModel = model('Review', reviewSchema)
export default reviewModel