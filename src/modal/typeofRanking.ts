import mongoose, { Schema } from 'mongoose'

const rankSchema = new Schema({
    rankType:{
        type :Array,
        required : true
    }
},
{ timestamps: true }
)
var rankModal = mongoose.model('rank', rankSchema)
export default rankModal;