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
        deptId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'department'
        },
        villageUniqueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'zone'
        }
    }]
},
    { timestamps: true }
)
var submitSurveyModal = mongoose.model('submitSurvey', submitSurveySchema)
export default submitSurveyModal;