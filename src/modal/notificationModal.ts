import mongoose, { Schema } from 'mongoose'

const notiSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    isPinned :{
        type : Boolean,
        default : false
    },
    createdDate :{
        type : Date,
        default : Date.now
    }
},
    { timestamps: true }
)
var notificationModal = mongoose.model('notification', notiSchema)
export default notificationModal;