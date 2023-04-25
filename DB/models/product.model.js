import { Types, Schema, model } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        unique: [true, "name is unique"],
        trim: true,
        min: [2, "min length must be at least 2"],
        max: [50, "max length must be 50"]
    },
    description: String,
    colors: [String],
    size: { type: [String], enum: ['l', "s", 'm', 'x'] },
    price: { type: Number, required: [true, "price is required"], default: 1 },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, required: [true, "price is required"], default: 1 },
    stock: { type: Number, required: [true, "stock is required"], default: 0 },
    amount: { type: Number, required: [true, "amount is required"], default: 0 },
    soldItems: { type: Number, required: [true, "soldItems is required"], default: 0 },
    customId: String,
    slug: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: [true, "createdBy is required"] },
    updatedBy: { type: Types.ObjectId, ref: "User", },
    mainImage: { type: Object },
    subImages: { type: [Object] },
    categoryId: { type: Types.ObjectId, ref: "Category", required: [true, "categoryId is required"] },
    subCategoryId: { type: Types.ObjectId, ref: "SubCategory", required: [true, "subCategory is required"] },
    brandId: { type: Types.ObjectId, ref: "Brand", required: [true, "BrandId is required"] },
    wishList: [{ type: Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
})

productSchema.virtual('Review', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'productId'
})

const productModel = model('Product', productSchema)
export default productModel