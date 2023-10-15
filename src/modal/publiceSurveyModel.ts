import mongoose, { Schema } from 'mongoose'

const publiceSurveySchema = new Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'survey'
    },
    isPublice:Boolean,

    villages:[
    {
    rank:String,
    email: {
        type: String
    },
    villageUniqueId: {
        type: String,
        ref: 'zone'
    },
    villageName: {
        type: String,
    },
    surveyDetail:{
        deptId: {
            type: mongoose.Types.ObjectId
        },
        deptName: {
            type: String
        },
        schemeDetails: [
            {
                schemeId: {
                    type: String
                },
                schemeName: {
                    type: String
                },
                questionnaire: [{
                    question: {
                        type: String
                    },
                    questionID: {
                        type: mongoose.Types.ObjectId
                    },
                    score: {   //score of the question
                        type: Number
                    },
                }]
            }
        ] 
    },
    deptTotalScore: {
        type : Number
    },
    departments: [{
        villageName:String,
        deptId: String,
        deptName: String,
        email: String,
        score: Number,

    }]
}]},
    { timestamps: true }
)
var publiceSurveyModal = mongoose.model('publiceSurveySchema', publiceSurveySchema)
export default publiceSurveyModal;