import mongoose, { Schema } from 'mongoose'

const surveySchema = new Schema({
    surveyName:{
        type :String,
        required : true
    },
    surveyorName:{
        type :String
    },
    // questionnaire : [{
    //     question:{
    //         type:String,
    //         required : true
    //     },
    //     answer:{
    //         type:String,
    //         required : true
    //     }
    // }],
    villageName:{
        type :Array
    },
    departmentName:{
        type :Array
    },
    // blockName:{
    //     type :String,
    //     required : true
    // },
    // talukaName:{
    //     type :String
    // },
    // districtName:{
    //     type :String,
    //     required : true
    // },
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