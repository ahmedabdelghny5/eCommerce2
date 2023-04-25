import orderModel from "../../DB/models/order.model.js";
import reviewModel from "../../DB/models/review.model.js";
import { appError, asyncHandler } from "../../utils/globalError.js";



//////////////////////////create review ////////////////////////
export const createReview = asyncHandler(async (req, res, next) => {

    const { productId } = req.params
    const { rating, comment } = req.body
    const order = await orderModel.findOne({
        userId: req.user._id,
        status: "delivered",
        "products.productId": productId
    })
    if (!order) {
        return next(new appError("you can not review this product before use it", 400))
    }
    
    const checkedReview = await reviewModel.findOne({
        createdBy: req.user._id,
        productId,
        orderId:order._id
    })
    if (checkedReview) {
        return next(new appError("already reviewed it", 400))
    }

    const review = await reviewModel.create({
        rating,
        comment,
        createdBy: req.user._id,
        productId,
        orderId:order._id
    })
    review ? res.status(201).json({ msg: "success", review }) : next(new appError("failed to create review"))
})


////////////////////////update review ////////////////////////

export const updateReview = asyncHandler(async (req, res, next) => {
    const { reviewId } = req.params

    const review = await reviewModel.findOne({ _id: reviewId,createdBy: req.user._id })
    if (!review) {
        return next(new appError("review not found", 404))
    }
    
    if (req.body.rating) {
        review.rating = req.body.rating
    }
    if (req.body.comment) {
        review.comment = req.body.comment
    }
    await review.save()
    return res.status(200).json({ msg: "success", review })
})