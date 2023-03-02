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
        required : true 
    },
    UniqueIDNumber:{
        type :Number, 
    },
    role:{
        type :String, 
        default: 'user',
        enum: ["VillageManager", "BlockManager", "supdistrictManager","superadmin"]
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
    isInspector :{
        type : Boolean,
        default : false
    },
    Village : {
        type : Array,
        ref : 'zone',
    },
    Departments : {
            type : Array,
            ref : 'department'
    },
    otp: { type: String },
    otpExpires: { type: Date },
    ReportingAuthorityName:{
        type :String
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