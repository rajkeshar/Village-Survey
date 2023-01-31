import mongoose, { Schema } from 'mongoose'

const deptSchema = new Schema({
    deptName: {
        type: String,
        required: true
    },
    schemeDetails: [
        {
            schemeId: {
                type: Number
            },
            schemeName: {
                type: String
            }
        }
    ],
    IsActive: {
        type: Boolean,
        default: true
    }
},
    { timestamps: true }
)
var deptModal = mongoose.model('department', deptSchema)
export default deptModal;