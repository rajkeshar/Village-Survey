import mongoose, { Schema } from 'mongoose'

const otpSchema = new Schema({
    otp:{
        type :String,
    },
    reqId:{
        type :String,
        required : true
    },
    contactNumber:{
        type :Number
    },
    createdDate:{
        type : Date,
        default : Date.now(),
        index :{
            expires : 300
        }
    }
},
{ timestamps: true }
)

var otpModal = mongoose.model('otp', otpSchema)
export default otpModal;