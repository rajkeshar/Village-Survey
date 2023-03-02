import mongoose, { Schema } from 'mongoose'

const villageSchema = new Schema({
    villageName:{
        type :String,
    },
    villageUniqueId:{
        type :String,
        required : true
    },
    departments:{
        type :Array //update dept value when superadmin add deprtment under village
    },
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