import { Types, Schema, model } from "mongoose";

const subCategorySchema = new Schema({
  
    name: {
        type: String,
        required: [true, "name is required"],
        unique: [true, "name is unique"],
        min: [2, "min length must be at least 2"],
        max: [50, "max length must be 50"]
    },
    customId: String,
    slug: { type: String, required: true },
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
    categoryId: {
        type: Types.ObjectId,
        ref: "Category",
    }
}, {
    timestamps: true
})

const subCategoryModel = model('SubCategory', subCategorySchema)
export default subCategoryModel