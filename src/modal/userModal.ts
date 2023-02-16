import mongoose, { Schema } from 'mongoose'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
dotenv.config()

const jwtToken:any = process.env.JWTSECRET_KEY;
const userSchema = new Schema({
    fullname:{
        type :String,
        required : true
    },
    email:{
        type :String,
        required : true 
    },
    password:{
        type :String,
    },
    contactNumber:{
        type :Number,
    },
    UniqueIDNumber:{
        type :Number, 
    },
    role:{
        type :String, 
        default: 'user',
        enum: ["user", "admin", "superadmin","officer", "surveyer"]
    },
    EmpID:{
        type :String,
        required : true
    },
    userStatus:{
        type :String,
        enum:["active", "block","inactive"],
        default : 'active'
    },
    AssignedSurveyDepartment:{
        type :String,
        ref : 'department'
    },
    Designation:{
        type :String,
        ref : 'department'
    },
    CurrentVillageName:{
        type :String,
    },
    CurrentTalukaName:{
        type :String,
    },
    otp: { type: String },
  otpExpires: { type: Date },
    ReportingAuthorityName:{
        type :String,
        required : true
    },
    NoofSurveyconducted:{
        type :Number,
    },
    IsActive:{
        type:Boolean,
        default:true
    }
},
{ timestamps: true }
)


var userModal = mongoose.model('user', userSchema)
export default userModal;