import mongoose, { Schema } from 'mongoose'

const submitSurveySchema = new Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'survey'
    },
    email: {
        type: String
    },
    villageUniqueId: {
        type: String,
        ref: 'zone'
    },
    surveyDetail: [{
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
    }],
},
    { timestamps: true }
)
var submitSurveyModal = mongoose.model('submitSurvey', submitSurveySchema)
export default submitSurveyModal;