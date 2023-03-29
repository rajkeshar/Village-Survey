import mongoose, { Schema } from 'mongoose'

const submitSurveySchema = new Schema({
    userEmail: {
        type: String,
        ref: 'user'
    },
    villageRankDetail: [{
        villageUniqueId: {
            type: String,
            ref: 'zone'
        },
        deptId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'department',
            ratings : {
                type : String
            }
        }
    }]
},
{ timestamps: true }
)
var submitSurveyModal = mongoose.model('villageranking', submitSurveySchema)
export default submitSurveyModal;