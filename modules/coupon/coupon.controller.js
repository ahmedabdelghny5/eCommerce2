import couponModel from "../../DB/models/coupon.model.js";
import { appError, asyncHandler } from "../../utils/globalError.js";
import { nanoid } from "nanoid";
import moment from 'moment'


//////////////////////////create coupon ////////////////////////
export const createCoupon = asyncHandler(async (req, res, next) => {

    const { name, amount, fromDate, toDate } = req.body
    const exist = await couponModel.findOne({ name: name.toLowerCase() })
    if (exist) {
        return next(new appError("name already found", 404))
    }

    const nowDate = moment().format('YYYY-MM-DD HH:mm')
    const fromDateMoment = moment(new Date(fromDate)).format('YYYY-MM-DD HH:mm')
    const toDateMoment = moment(new Date(toDate)).format('YYYY-MM-DD HH:mm')

    if (moment(fromDateMoment).isBefore(moment(nowDate)) || moment(toDateMoment).isBefore(moment(nowDate))) {
        return next(new appError("invalid date plz enter date more than now", 402))
    }
    if (moment(fromDateMoment).isSameOrAfter(moment(toDateMoment))) {
        return next(new appError("invalid date", 402))
    }

    const coupon = await couponModel.create({
        name: name.toLowerCase(),
        amount,
        fromDate: fromDateMoment,
        toDate: toDateMoment,
        createdBy: req.user._id
    })
    await coupon.save()
    coupon ? res.status(201).json({ msg: "success", coupon }) : next(new appError("failed to create coupon"))

})


////////////////////////update coupon ////////////////////////

export const updateCoupon = asyncHandler(async (req, res, next) => {
    const { couponId } = req.params

    const coupon = await couponModel.findOne({ _id: couponId })
    if (!coupon) {
        return next(new appError("coupon not found", 404))
    }
    if (req.body.name.toLowerCase()) {
        if (coupon.name.toLowerCase() == req.body.name.toLowerCase()) {
            return next(new appError("match old name plz change name", 400))
        }
        if (await couponModel.findOne({ name: req.body.name.toLowerCase() })) {
            return next(new appError("duplicated name", 400))
        }
        coupon.name = req.body.name.toLowerCase()
    }
    if (req.body.amount) {
        coupon.amount = req.body.amount
    }
    if (req.body.toDate || req.body.fromDate) {
        const nowDate = moment().format('YYYY-MM-DD HH:mm')
        if (moment(req.body.fromDate).isBefore(moment(nowDate)) || moment(req.body.toDate).isBefore(moment(nowDate))) {
            return next(new appError("invalid date plz enter date more than now", 402))
        }
        if (moment(req.body.fromDate).isSameOrAfter(moment(req.body.toDate))) {
            return next(new appError("invalid date", 402))
        }
    }
    coupon.updatedBy = req.user._id
    if (Object.keys(req.body).length < 0) {
        return next(new appError('plz enter data to update ', 404))
    }
    await coupon.save()
    return res.status(200).json({ msg: "success", coupon })
})