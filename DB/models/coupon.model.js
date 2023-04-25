import { Types, Schema, model } from "mongoose";

const couponSchema = new Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        unique: [true, "name is unique"],
        min: [2, "min length must be at least 2"],
        max: [10, "max length must be 50"]
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
    },
    usedBy: [{
        type: Types.ObjectId,
        ref: "User",
    }],
    updatedBy: {
        type: Types.ObjectId,
        ref: "User",
    },
    amount: { type: Number, required: [true, "amount is required"], default: 1 },
    fromDate: { type: String, required: [true, "fromDate is required"] },
    toDate: { type: String, required: [true, "toDate is required"] },
}, {
    timestamps: true
})

const couponModel = model('Coupon', couponSchema)
export default couponModel