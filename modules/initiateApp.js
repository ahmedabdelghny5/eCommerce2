
import { dbConnection } from '../DB/dbConnection.js'
import express from 'express'
import userRouter from './user/user.routes.js'
import categoryRouter from './category/category.routes.js'
import subCategoryRouter from './subCategory/subCategory.routes.js'
import brandRouter from './brand/brand.routes.js'
import couponRouter from './coupon/coupon.routes.js'
import productRouter from './product/product.routes.js'
import cartRouter from './cart/cart.routes.js'
import orderRouter from './order/order.routes.js'
import reviewRouter from './review/review.routes.js'
import { globalErrorHandler } from '../utils/globalError.js'
import morgan from 'morgan'
import chalk from 'chalk';
import cors from 'cors'

export const initApp = (app) => {
    const port = process.env.PORT || 3000

    app.use(cors({}))
    app.use((req, res, next) => {
        if (req.originalUrl == '/orders/webhook') {
            next()
        }
        express.json({})(req, res, next)
    })
    if (process.env.MOOD == 'DEV') {
        app.use(morgan('dev'))
    } else {
        app.use(morgan('combined'))
    }

    app.use(`${process.env.BASE_URL}/users`, userRouter)
    app.use(`${process.env.BASE_URL}/categories`, categoryRouter)
    app.use(`${process.env.BASE_URL}/subCategory`, subCategoryRouter)
    app.use(`${process.env.BASE_URL}/brands`, brandRouter)
    app.use(`${process.env.BASE_URL}/coupons`, couponRouter)
    app.use(`${process.env.BASE_URL}/products`, productRouter)
    app.use(`${process.env.BASE_URL}/carts`, cartRouter)
    app.use(`${process.env.BASE_URL}/orders`, orderRouter)
    app.use(`${process.env.BASE_URL}/reviews`, reviewRouter)

    app.all('*', (req, res, next) => {
        next(new appError('invalid routing', 500))
    })
    app.use(globalErrorHandler)
    dbConnection()
    app.listen(port, () => console.log(chalk.blue(`Example app listening on port ${port}!`)))
}
