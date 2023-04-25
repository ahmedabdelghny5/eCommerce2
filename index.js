process.on("uncaughtException",(err)=>{
    console.log("uncaughtException",err);
})

import express from 'express'
import { config } from 'dotenv'
import path from 'path'
import { initApp } from './modules/initiateApp.js'
config({ path: path.resolve("config/.env") })
const app = express()
initApp(app)



// app.set("case sensitive routing",true)
process.on("unhandledRejection",(err)=>{
    console.log("unhandledRejection",err);
})