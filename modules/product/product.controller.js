


import brandModel from "../../DB/models/brand.model.js";
import productModel from "../../DB/models/product.model.js";
import subCategoryModel from "../../DB/models/subCategory.model.js";
import userModel from "../../DB/models/user.model.js";
import ApiFeature from "../../utils/apiFeatures.js";
import cloudinary from "../../utils/cloudinary.js";
import { appError, asyncHandler } from "../../utils/globalError.js";
import { nanoid } from "nanoid";
import slugify from 'slugify'

//////////////////////////create product ////////////////////////
export const createProduct = asyncHandler(async (req, res, next) => {
   
    const { name, amount, price, discount, brandId, subCategoryId, categoryId } = req.body
    const exist = await productModel.findOne({ name })
    if (exist) {
        return next(new appError("product name is already created", 400))
    }
    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, categoryId })
    if (!subCategory) {
        return next(new appError("subCategory or category not found", 404))
    }
    const brand = await brandModel.findById({ _id: brandId })
    if (!brand) {
        return next(new appError("brand not found", 404))
    }

    req.body.slug = slugify(name)
    req.body.stock = amount
    req.body.createdBy = req.user._id
    req.body.finalPrice = price - (price * ((discount || 0) / 100))

    const customId = nanoid(5)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
        folder: `eCommerce/product/${customId}`
    })
    req.body.customId = customId
    req.body.mainImage = { secure_url, public_id }
    if (req.files.subImages) {
        for (const file of req.files.subImages) {
            req.body.subImages = []
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: `eCommerce/product/${customId}/subImages`
            })
            req.body.subImages.push({ secure_url, public_id })
        }
    }
    const product = await productModel.create(req.body)
    return res.status(201).json({ msg: "success", product })
})

//////////////////////////update product ////////////////////////
export const updateProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params
    const { amount, price, discount, brandId, subCategoryId, categoryId } = req.body
    //>>>>check product <<<<<<\\
    const product = await productModel.findById({ _id: productId })
    if (!product) {
        return next(new appError("product not found", 404))
    }
    //>>>>check subCategoryId & categoryId<<<<<<\\
    if (subCategoryId && categoryId) {
        const Category = await subCategoryModel.findOne({ _id: subCategoryId, categoryId })
        if (!Category) {
            return next(new appError('invalid id on subCategory or category', 404))
        }
    }
    //>>>>check brandId <<<<<<\\
    if (brandId) {
        const Brand = await brandModel.findOne({ _id: brandId })
        if (!Brand) {
            return next(new appError('invalid id on Brand', 404))
        }
    }
    //>>>>check name <<<<<<\\
    if (req.body.name) {
        if (product.name == req.body.name) {
            return next(new appError("match old name plz change name", 400))
        }
        if (await productModel.findOne({ name: req.body.name })) {
            return next(new appError("duplicated name", 400))
        }
        product.name = req.body.name
        product.slug = slugify(req.body.name)
    }
    //>>>>check description <<<<<<\\
    if (req.body.description) {
        product.description = req.body.description
    }
    //>>>>check price & discount <<<<<<\\
    if (price && discount) {
        req.body.finalPrice = price - (price * ((discount) / 100))
    } else if (price) {
        req.body.finalPrice = price - (price * ((product.discount) / 100))
    } else if (discount) {
        req.body.finalPrice = product.price - (product.price * ((discount) / 100))
    }
    //>>>>check amount<<<<<<\\
    if (amount) {
        const conStock = amount - product.soldItems
        conStock > 0 ? req.body.stock = conStock : req.body.stock = 0
    }
    //>>>>check mainImage<<<<<<\\
    if (req.files?.mainImage?.length) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
            folder: `eCommerce/product/${product.customId}`
        })
        await cloudinary.uploader.destroy(product.mainImage.public_id)
        req.body.mainImage = { secure_url, public_id }
    }
    //>>>>check subImages<<<<<<\\
    if (req.files?.subImages?.length) {
        req.body.subImages = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: `eCommerce/product/${product.customId}/subImages/`
            })
            req.body.subImages.push({ secure_url, public_id })
        }
    }
    //>>>>check updatedBy<<<<<<\\
    req.body.updatedBy = req.user._id

    const updatedProduct = await productModel.findByIdAndUpdate({ _id: productId }, req.body, { new: false })
    if (updatedProduct) {
        for (const imgIds of product.subImages) {

            await cloudinary.uploader.destroy(imgIds.public_id)
        }
        res.status(200).json({ msg: "success", updatedProduct })
    } else {
        next(new appError('fail', 500))
    }
})

// /////////////////////add to wishList  ////////////////////////////
export const addToWishList = asyncHandler(async (req, res, next) => {
    const { productId } = req.params
    const products = await productModel.findById(productId)
    if (!products) {
        return next(new appError("product not found", 400))
    }
    await userModel.updateOne({ _id: req.user._id }, { $addToSet: { wishList: productId } })
    return res.status(200).json({ msg: "success" })
})
// /////////////////////remove to wishList  ////////////////////////////
export const removeFromWishList = asyncHandler(async (req, res, next) => {
    const { productId } = req.params
    const products = await productModel.findById(productId)
    if (!products) {
        return next(new appError("product not found", 400))
    }
    await userModel.updateOne({ _id: req.user._id }, { $pull: { wishList: productId } })
    return res.status(200).json({ msg: "success" })
})

// /////////////////////get product ////////////////////////////

export const getProducts = asyncHandler(async (req, res, next) => {

    const apiFeature = new 
    ApiFeature(productModel.find(), req.query).paginate().filter().sort().select().search()

    const products = await apiFeature.mongooseQuery
    if (products.length < 0) {
        return next(new appError("products not found", 400))
    }
    return res.status(200).json({ msg: "success",page:apiFeature.page, products })
})
