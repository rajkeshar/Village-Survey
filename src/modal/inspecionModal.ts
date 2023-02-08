import mongoose, { Schema } from 'mongoose'

const surveySchema = new Schema({
    surveyName:{
        type :String,
        required : true
    },
    questionnaire : [{
        question:{
            type:String,
            required : true
        },
        answer:{
            type:String,
            required : true
        }
    }],
    villageName:{
        type :String,
        required : true
    },
    departmentName:{
        type :String,
        required : true
    },
    blockName:{
        type :String,
        required : true
    },
    talukaName:{
        type :String
    },
    districtName:{
        type :String,
        required : true
    },
    surveyStartDate:{
        type :Date
    },
    surveyEndDate:{
        type :Date
    },
    surveyorName:{
        type :String
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