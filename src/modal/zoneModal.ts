import mongoose, { Schema } from 'mongoose'

const villageSchema = new Schema({
    villageName:{
        type :String,
    },
    villageUniqueId:{
        type :String,
        required : true
    },
    isDisable :{
        type: Boolean,
        default : false
    }
})
const blockSchema = new Schema({
    blockName:{
        type :String,
    },
    blockUniqueId:{
        type :String,
        required : true
    },
    taluka:{
        talukaName:{
            type :String
        },
        talukaUniqueId :{
            type : String
        },
    villages:[villageSchema]
    }
})
const locationSchema = new Schema({
    districtName:{
        type :String,
    },
    pincode:{
        type :String,
        required : true
    },
    blocks:[blockSchema],
},
{ timestamps: true }
)

var zoneModal = mongoose.model('zone', locationSchema)
export default zoneModal;