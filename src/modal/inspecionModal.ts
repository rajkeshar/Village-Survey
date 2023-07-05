import mongoose, { Schema } from 'mongoose'

const surveySchema = new Schema({
    surveyName:{
        type :String,
        required : true
    },
    // surveyorLoginId:{
    //     type :String
    // },
    villageUniqueIds:[{
        villageId:{
            type : String
        },
        highestScore:{
            type : Number
        },
        departmentIds:{
            type :[mongoose.Schema.Types.ObjectId]
        },
    }],
    departmentIds:{
        type :[mongoose.Schema.Types.ObjectId]
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
    surveySubmitDateTime:{
        type:Date,
        default: Date.now()
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