import mongoose, { Schema } from 'mongoose'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
dotenv.config()

const jwtToken:any = process.env.JWTSECRET_KEY;
const combinationSchema:any = new Schema({
        deptName:{type:String,required:true},
        deptId:{type:String,required:true},
        villageName:{type:String,required:true},
        villageId:{type:String,required:true},
        userID:{type:String,required:true},
        userEmail:{type:String,required:true},
        userName:{type:String,required:true},
        isDisable :{
            type : Boolean,
            default : false
        }
    },
{ timestamps: true }
)


var combinationModel:any = mongoose.model('combination', combinationSchema)
export default combinationModel;