import mongoose, { Schema } from 'mongoose'

const scheme = new Schema({
    schemeName: {
        type:String
    },
    Ranking : {
        type : Number
    }
});
const departmentSchema = new Schema({
    departmentName: {
        type:String
    },
    departmentScheme : [scheme]

});
const villageSchema = new Schema({
    villageName:{
        type :String,
    },
    villageUniqueId:{
        type :String,
        required : true
    },
    RankINDepartmentScheme:[departmentSchema]
})
const blockSchema = new Schema({
    blockName:{
        type :String,
    },
    blockUniqueId:{
        type :String,
        required : true
    },
    villages:[villageSchema]
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

var villageModal = mongoose.model('village', locationSchema)
export default villageModal;