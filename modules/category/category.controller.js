
import categoryModel from "../../DB/models/category.model.js";
import cloudinary from "../../utils/cloudinary.js";
import { appError, asyncHandler } from "../../utils/globalError.js";
import { nanoid } from "nanoid";
import slugify from 'slugify'

//////////////////////////create category ////////////////////////
export const createCategory = asyncHandler(async (req, res, next) => {
    const { name } = req.body
    const exist = await categoryModel.findOne({ name })
    if (exist) {
        return next(new appError("category name is already created",400))
    }
    const customId = nanoid(5)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `eCommerce/categories/${customId}`
    })
    const category = await categoryModel.create({
        name,
        slug: slugify(name),
        image: { secure_url, public_id },
        createdBy: req.user._id,
        customId
    })
    if (!category) {
        await cloudinary.uploader.destroy(public_id)
        return next(new appError("failed to create category",400))
    }
    return res.status(201).json({ msg: "success", category })
})


//////////////////////////update category ////////////////////////

export const updateCategory = asyncHandler(async (req, res, next) => {

    const category = await categoryModel.findById({ _id: req.params.categoryId })
    if (!category) {
        return next(new appError("category not found",404))
    }
    if (req.body.name) {
        if (category.name == req.body.name) {
            return next(new appError("match old name plz change name",400))
        }
        if (await categoryModel.findOne({ name: req.body.name })) {
            return next(new appError("duplicated name",400))
        }
        category.name = req.body.name
        category.slug = slugify(req.body.name)
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `eCommerce/categories/${category.customId}`
        })
        await cloudinary.uploader.destroy(category.image.public_id)
        category.image = { secure_url, public_id }
    }
    category.updatedBy = req.user._id
    await category.save()
    return res.status(200).json({ msg: "success", category })
})


///////////////////////////get all categories////////////////////////
export const getAllCategories = asyncHandler(async (req, res,next) => {
 
    const categories = await categoryModel.find({}).populate({
        path:'SubCategory'
    })
    if(categories.length<0) {
        return next(new appError("categories not found",400))
    }
    return res.status(200).json({ msg: "success", categories })
})