import chalk from "chalk";
import mongoose from "mongoose";

export const dbConnection = () => {
    mongoose.connect(process.env.URI).then(() => {
        console.log(chalk.blue(`db connection successfully on ${process.env.URI}`));
    }).catch((err) => {
        console.log(chalk.red("db connection failed"));
    })
}
mongoose.set("strictQuery", true)