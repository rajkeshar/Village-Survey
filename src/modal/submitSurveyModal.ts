import mongoose, { Schema } from 'mongoose'

const submitSurveySchema = new Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'suvey'
    },
    surveyDetail: [{
        email: {
            type: String
        },
        departmentScore: {
            deptId:{
                type : mongoose.Types.ObjectId
            },
            schemeDetails: [
                {
                    schemeId: {
                        type: String
                    },
                    questionnaire : [{
                        questionID:{
                            type:mongoose.Types.ObjectId
                        },
                        score:{   //score of the question
                            type:Number
                        },
                    }]
                }
            ],
        },
        totalScore : {
            type: Number
        },
        villageUniqueId: {
            type: String,
            ref: 'zone'
        }
    }]
},
    { timestamps: true }
)
var submitSurveyModal = mongoose.model('submitSurvey', submitSurveySchema)
export default submitSurveyModal;