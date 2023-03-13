import mongoose, { Schema } from 'mongoose'

const surveySchema = new Schema({
    surveyName:{
        type :String,
        required : true
    },
    surveyorName:{
        type :String
    },
    villageName:{
        type :Array
    },
    departmentName:{
        type :Array
    },
    surveyStartDate:{
        type :Date
    },
    surveyEndDate:{
        type :Date
    },
    IsOnGoingSurvey:{
        type :String, 
        enum: ["pending", "OnGoing", "completed"],
        default:"pending"
    },
    IsActive:{
        type:Boolean,
        default:true
    }
},
{ timestamps: true }
)
var surveyModal = mongoose.model('survey', surveySchema)
export default surveyModal;