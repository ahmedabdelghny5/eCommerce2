import { Types, Schema, model } from "mongoose";

const categorySchema = new Schema({
    customId: String,
    slug: { type: String, required: true },
    name: {
        type: String,
        required: [true, "name is required"],
        unique: [true, "name is unique"],
        min: [2, "min length must be at least 2"],
        max: [50, "max length must be 50"]
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: "User",
    },
    image: {
        type: Object,
        required: [true, "image is required"],
    },


}, {
    toObject:{ virtuals: true },
    toJSON:{ virtuals: true },
    timestamps: true
})

categorySchema.virtual('SubCategory', {
    ref: 'SubCategory',
    localField: '_id',
    foreignField: 'categoryId'
  });

const categoryModel = model('Category', categorySchema)
export default categoryModel