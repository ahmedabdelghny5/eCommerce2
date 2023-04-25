import categoryModel from "../../DB/models/category.model.js";
import brandModel from "../../DB/models/brand.model.js";
import cloudinary from "../../utils/cloudinary.js";
import { appError, asyncHandler } from "../../utils/globalError.js";
import { nanoid } from "nanoid";
import slugify from 'slugify'

//////////////////////////create brand ////////////////////////
export const createBrand = asyncHandler(async (req, res, next) => {

    const { name } = req.body
    const exist = await brandModel.findOne({ name })
    if (exist) {
        return next(new appError("name already found", 404))
    }
    const customId = nanoid(5)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `eCommerce/Brand/${customId}`
    })
    const brand = await brandModel.create({
        name,
        slug: slugify(name),
        image: { secure_url, public_id },
        createdBy: req.user._id,
        customId
    })
    if (!brand) {
        await cloudinary.uploader.destroy(public_id)
        return next(new appError("failed to create brand", 500))
    }
    return res.status(201).json({ msg: "success", brand })
})


////////////////////////update brand ////////////////////////

export const updateBrand = asyncHandler(async (req, res, next) => {
    const { brandId } = req.params

    const brand = await brandModel.findOne({ _id: brandId })
    if (!brand) {
        return next(new appError("brand not found", 404))
    }
    if (req.body.name) {
        if (brand.name == req.body.name) {
            return next(new appError("match old name plz change name", 400))
        }
        if (await brandModel.findOne({ name: req.body.name })) {
            return next(new appError("duplicated name", 400))
        }
        brand.name = req.body.name
        brand.slug = slugify(req.body.name)
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `eCommerce/Brand/${brand.customId}`
        })
        await cloudinary.uploader.destroy(brand.image.public_id)
        brand.image = { secure_url, public_id }
    }
    brand.updatedBy = req.user._id
    await brand.save()
    return res.status(200).json({ msg: "success", brand })
})