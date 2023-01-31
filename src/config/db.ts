// require("dotenv").config()
// import { DataSource } from "typeorm"
// import { User } from "../entity/userEntity";
// import { WhiteList } from "../entity/whitelistEntity";


// const DB_HOST = process.env.DB_HOST
// const DB_USER = process.env.DB_USER
// const DB_PASSWORD = process.env.DB_PASSWORD
// const DB_DATABASE = process.env.DB_DATABASE
// const DB_PORT = process.env.DB_PORT
// const TYPE = process.env.TYPEORM


//  const myDataSource = new DataSource({
//     type: TYPE as any,
//     host: DB_HOST,
//     port: DB_PORT as any,
//     username: DB_USER,
//     password: DB_PASSWORD,
//     database: DB_DATABASE,
//     entities: [User,WhiteList],
//     logging: true,
//     synchronize: true,
// })
// export default myDataSource

import mongoose from 'mongoose'
mongoose.set('strictQuery', true);
const connectDB = async (mongoDBURL: string | undefined) => {
  try {
      const conn = await mongoose.connect('mongodb://localhost:27017/VillageSurvey')
      console.log(`MongoDB Connected.....`)
  } catch (error) {
    console.log(error)
  }
}

export default connectDB