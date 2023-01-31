import mongoose, { Schema } from 'mongoose'

const scheme = new Schema({
    schemeName:{
        type: String,
        required: true
    },
    Ranking :{
        type :Number
    }
})
const surveySchema = new Schema({
    surveyorName:{
        type :String,
        required : true
    },
    villageName:{
        type :Array
    },
    blockName:{
        type :Array
    },
    talukaName:{
        type :Array
    },
    districtName:{
        type :String,
        required : true
    },
    schemes:[scheme],
    surveyEndDate:{
        type :Date
    },
    surveyerName:{
        type :String
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