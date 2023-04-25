import categoryModel from "../../DB/models/category.model.js";
import subCategoryModel from "../../DB/models/subCategory.model.js";
import cloudinary from "../../utils/cloudinary.js";
import { appError, asyncHandler } from "../../utils/globalError.js";
import { nanoid } from "nanoid";
import slugify from 'slugify'

//////////////////////////create subcategory ////////////////////////
export const createSubCategory = asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params
    const { name } = req.body
    const exist = await subCategoryModel.findOne({ name })
    if (exist) {
        return next(new appError("name already found", 404))
    }
    const category = await categoryModel.findById({ _id: categoryId })
    if (!category) {
        return next(new appError("category not found", 404))
    }
    const customId = nanoid(5)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `eCommerce/categories/${categoryId}/${customId}`
    })
    const subCategory = await subCategoryModel.create({
        name,
        slug: slugify(name),
        image: { secure_url, public_id },
        createdBy: req.user._id,
        customId,
        categoryId
    })
    if (!subCategory) {
        await cloudinary.uploader.destroy(public_id)
        return next(new appError("failed to create subCategory"))
    }
    return res.status(201).json({ msg: "success", subCategory })
})


////////////////////////update subCategory ////////////////////////

export const updateSubCategory = asyncHandler(async (req, res, next) => {
    const { categoryId, subCategoryId } = req.params

    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, categoryId })
    if (!subCategory) {
        return next(new appError("subCategory or category not found",404))
    }
    if (req.body.name) {
        if (subCategory.name == req.body.name) {
            return next(new appError("match old name plz change name",400))
        }
        if (await subCategoryModel.findOne({ name: req.body.name })) {
            return next(new appError("duplicated name",400))
        }
        subCategory.name = req.body.name
        subCategory.slug = slugify(req.body.name)
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `eCommerce/categories/${categoryId}/${subCategory.customId}`
        })
        await cloudinary.uploader.destroy(subCategory.image.public_id)
        subCategory.image = { secure_url, public_id }
    }
    subCategory.updatedBy = req.user._id
    await subCategory.save()
    return res.status(200).json({ msg: "success", subCategory })
})