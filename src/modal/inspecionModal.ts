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
        type :Array
    },
    departmentName:{
        type :Array
    },
    blockName:{
        type :Array
    },
    talukaName:{
        type :Array
    },
    districtName:{
        type :Array
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
        enum: ["pending", "OnGoing", "completed"]
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