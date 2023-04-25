import { Types, Schema, model } from "mongoose";

const userSchema = new Schema({
    customId: String,
    name: {
        type: String,
        required: [true, "name is required"],
        min: [2, "min length must be at least 2"],
        max: [50, "max length must be 50"]
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "email must be unique"]
    },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: "User", enum: ["User", "Admin"] },
    confirmed: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    image: String,
    publicId: String,
    changePasswordAt: Date,
    code: { type: String, default: "" },
    wishList:[{
        type:Types.ObjectId,
        ref:"Product"
    }]
}, {
    timestamps: true
})

const userModel = model('User', userSchema)
export default userModel