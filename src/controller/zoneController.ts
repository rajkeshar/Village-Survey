import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import zoneModal from '../modal/zoneModal'
import xlsx from 'xlsx';

export async function addNewZone(req: Request, res: Response) {
    try {
        let { blockUniqueId, blockName, villageName, villageUniqueId, zoneId,
            districtName, pincode , talukaName, talukaUniqueId} = req.body
       
        let newZone = new zoneModal({
            blockUniqueId, villageName, villageUniqueId,
            districtName: districtName,
            pincode: pincode
            // 'blocks': [{
            //     blockName: blockName,
            //     blockUniqueId: blockUniqueId,
            //     'villages': [{
            //         villageName: villageName,
            //         villageUniqueId: villageUniqueId
            //     }]
            // }],
        })
        if (!zoneId) {
             if (!districtName || !pincode ) return res.status(400).send({ message: "Please send districtName & pincode fields" })
            await newZone.save();
            return res.status(201).send({ message: "Zone created succesfully", success: true, data: newZone });
        } else {
            if (!blockName || !blockUniqueId ) return res.status(400).send({ message: "Please send blockName & blockUniqueId fields" })
            let payload = {
                blockName: blockName,
                blockUniqueId: blockUniqueId,
                taluka:{
                    talukaName : talukaName,
                    talukaUniqueId : talukaUniqueId
                }
                // 'villages': [{
                //     villageName: villageName,
                //     villageUniqueId: villageUniqueId
                // }]
            }
            const setQuery = { $addToSet: { "blocks": { $each: [payload] } } };
            const updateZone = await zoneModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(zoneId) }, setQuery, { new: true });
            return res.status(201).send({ message: "Succesfully added  block", data: updateZone, success: true });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function addNewVillage(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let { blockUniqueId, talukaUniqueId, villageUniqueId, villageName } = req.body
        if(!blockUniqueId || !villageUniqueId || !villageName || !talukaUniqueId) return res.status(400).send({ message: "Please send all required fields" })

        let isExistBlock = await zoneModal.findOne({"_id" :new mongoose.Types.ObjectId(id),"blocks" :{$elemMatch:{"taluka.talukaUniqueId":talukaUniqueId}}});
        if(!isExistBlock) return res.status(400).json({ message: "This taluka id is not exist, Invalid ID" })

        let newVillage = await zoneModal.findOneAndUpdate({"_id" :new mongoose.Types.ObjectId(id), "blocks": { $elemMatch: { "taluka.talukaUniqueId":talukaUniqueId } } },
            {
                $addToSet: {
                    "blocks.$.taluka.villages": {
                        $each: [{
                            villageName: villageName,
                            villageUniqueId: villageUniqueId
                        }]
                    }
                }
            },{new:true} )
        return res.status(201).send({ message: "village created succesfully", success: true, data: newVillage });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function addNewTaluka(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let { blockUniqueId, talukaName, talukaUniqueId } = req.body
        if(!blockUniqueId || !talukaName || !talukaUniqueId) return res.status(400).send({ message: "Please send all required fields" })

        let isExistBlock = await zoneModal.findOne({"_id" :new mongoose.Types.ObjectId(id),"blocks" :{$elemMatch:{"blockUniqueId":blockUniqueId}}});
        if(!isExistBlock) res.status(400).send({ message: "This block id is not exist, Invalid ID" })

        let newtaluka = await zoneModal.findOneAndUpdate({"_id" :new mongoose.Types.ObjectId(id), "blocks": { $elemMatch: { "blockUniqueId": blockUniqueId } } },
        { $set: {
                "blocks.$.taluka": {
                    talukaName: talukaName,
                    talukaUniqueId: talukaUniqueId
                }
            }
        })
        return res.status(201).send({ message: "Taluka created succesfully", success: true, data: newtaluka });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function updateZone(req: Request, res: Response) {
    try {
        let { districtName, blockName, blockUniqueId, villageName, talukaName, talukaUniqueId, villageUniqueId } = req.body
        let { id } = req.params;
        let zone = await zoneModal.findOne({ _id: new mongoose.Types.ObjectId(id) })
        if (!zone) return res.status(400).send({ mesage: "This Id is not exist, Invalid ID" })
        let result;
        if (districtName) {
            result = await zoneModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) },
                { $set: { districtName: districtName } } ,{new : true})
        }
        if (blockUniqueId) {
            result = await zoneModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) },
                { $set: { "blocks.$[e].blockName": blockName } },
                { arrayFilters: [{ "e.blockUniqueId": blockUniqueId }] , new: true})
        }
        if (blockUniqueId && villageUniqueId && talukaUniqueId) {
            result = await zoneModal.findOneAndUpdate({ "blocks.blockUniqueId": blockUniqueId, "blocks.taluka.talukaUniqueId": talukaUniqueId, "blocks.taluka.villages.villageUniqueId": villageUniqueId },
                { $set: { "blocks.$[b].taluka.villages.$[v].villageName": villageName } },
                { arrayFilters: [{ "b.blockUniqueId": blockUniqueId }, { "v.villageUniqueId": villageUniqueId }],new: true })
        }
        if (blockUniqueId && talukaUniqueId) {
            result = await zoneModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id), "blocks": { $elemMatch: { "blockUniqueId": blockUniqueId, "taluka.talukaUniqueId": talukaUniqueId } } },
                { $set: { "blocks.$[e].taluka.talukaName": talukaName } },
                { arrayFilters: [{ "e.blockUniqueId": blockUniqueId }],new: true })
        }
        return res.status(201).json({ message: "updated successfully", data: result, success: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function deleteZone(req: Request, res: Response) {
    try {
        let { id } =  req.params;
        let zone = await zoneModal.findOne({_id : new mongoose.Types.ObjectId(id)})
        if(!zone) return res.status(400).send({mesage : "This Id is not exist, Invalid ID"})
        await zoneModal.deleteOne({_id : new mongoose.Types.ObjectId(id)})
        return res.status(201).send({mesage : "Deleted successfully", success: true})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function deleteBlockOrVillage(req: Request, res: Response) {
    try {
        let { id ,block} =  req.params;
        let {  blockName, villageUniqueId, blockUniqueId } = req.body;
        let zone = await zoneModal.findOne({_id : new mongoose.Types.ObjectId(id)})
        if(!zone) return res.status(400).send({mesage : "This Id is not exist, Invalid ID"})

        if( block === 'block' ) {
            await zoneModal.findOneAndUpdate({_id : new mongoose.Types.ObjectId(id)},
            { $pull: { 'blocks':{ 'blockUniqueId': blockUniqueId }}})
        } else {
            await zoneModal.findOneAndUpdate({_id : new mongoose.Types.ObjectId(id),
                "blocks" :{$elemMatch:{"blockUniqueId":blockUniqueId}}},
                { $pull: { 'blocks.$.villages':{ 'villageUniqueId': villageUniqueId }}})
        }
        return res.status(201).send({mesage : "Deleted successfully", success: true})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getZoneById(req: Request, res: Response) {
    try {
        let { id } =  req.params;
        let zone = await zoneModal.findOne({_id : new mongoose.Types.ObjectId(id)})
        if(!zone) return res.status(400).send({mesage : "This Id is not exist, Invalid ID"})
        return res.status(201).send({mesage : "fetched successfully", success: true, result : zone})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getAllDistrict(req: Request, res: Response) {
    try {
        let DistList = await zoneModal.find();
        if(!DistList) return res.status(201).send({message : "No District found"})
        let distArray = [] as any;
        DistList.map(x => {
            distArray.push({
                districtName : x.districtName,
                pincode : x.pincode
            })
        })
        return res.status(201).send({message : "District List", data : distArray})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getAllBlocks(req: Request, res: Response) {
    try {
       let { distId } = req.params;
        let blockList = await zoneModal.findOne({ _id : new mongoose.Types.ObjectId(distId)}) as any
        if(!blockList) return res.status(201).send({message : "District Id is not found, Invalid ID"})
        let result = await zoneModal.findOne({"_id" : new mongoose.Types.ObjectId(distId)},  {"blocks.blockName": 1, "blocks.blockUniqueId": 1 })           
        return res.status(201).send({message : "list of blocks", data: result})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getAllTaluka(req: Request, res: Response) {
    try {
       let { distId } = req.params;
        let talukaList = await zoneModal.findOne({ _id : new mongoose.Types.ObjectId(distId)}) as any
        if(!talukaList) return res.status(201).send({message : "District Id is not found, Invalid ID"})
        let talukaArray= []as any;
        talukaList?.blocks.map((x)=>{
            let talukaNme = x.taluka?.talukaName as any
            let talukaUniqueID = x.taluka?.talukaUniqueId as any
            if( talukaNme && talukaUniqueID) {
                talukaArray.push({
                    talukaName :talukaNme,
                    talukaUniqueId : talukaUniqueID
                })
            }
        })
        return res.status(201).send({message : "list of taluka", data: talukaArray})
        // let result = await zoneModal.aggregate([
        //     { $unwind: "$blocks" },
        //     { $group: { _id: "$blocks.taluka.talukaName" } },
        //     { $project: { _id: 0, talukaName: "$_id" } }
        //   ])
         
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getAllVillage(req: Request, res: Response) {
    try {
        
        let dist = await zoneModal.findOne({ IsActive  : true  });
        if (!dist) return res.status(201).send({ message: "District Id or block Id is not found, Invalid ID" })
        let villageArray = [] as any;
        let result = await zoneModal.aggregate([
            { $unwind: "$blocks" },
            { $unwind: "$blocks.taluka.villages" },
            { $project: {
                _id: 1,
                districtName : 1,
                villageName: "$blocks.taluka.villages.villageName",
                villageUniqueId: "$blocks.taluka.villages.villageUniqueId"
            }}])
        return res.status(201).send({ message: "list of villages", data: result, success : true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })    }
}
export async function getAllTalukaList(req: Request, res: Response) {
    try {
        let result = await zoneModal.aggregate([
            { $unwind: "$blocks" },
            { $unwind: "$blocks.taluka" },
            { $project: {
                _id: 1,
                pincode : 1,
                taluka: "$blocks.taluka"
            }}])
        return res.status(201).send({ message: "list of taluka", data: result, success : true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })    }
}
export async function getAllVillageBasedOnTalukId(req: Request, res: Response) {
    try {
        let { id, blockUniqueId , talukaUniqueId} = req.params;
        let dist = await zoneModal.findOne({_id : new mongoose.Types.ObjectId(id),"blocks" :{$elemMatch:{"blockUniqueId":blockUniqueId,"taluka.talukaUniqueId":talukaUniqueId}}});
        if (!dist) return res.status(201).send({ message: "District Id , block Id or taluka Id are not found, Invalid ID" })
    
        let result = await zoneModal.aggregate([
            {
              $match: {
                "blocks.taluka.talukaUniqueId": talukaUniqueId // Replace with the desired talukaUniqueId
              }
            },
            {
              $unwind: "$blocks"
            },
            {
              $match: {
                "blocks.taluka.talukaUniqueId": talukaUniqueId // Replace with the desired talukaUniqueId
              }
            },
            {
              $replaceRoot: {
                newRoot: "$blocks.taluka"
              }
            },
            {
              $project: {
                _id: 0,
                talukaName: 1,
                talukaUniqueId: 1,
                villages: 1
              }
            }
          ])
          
        return res.status(201).send({ message: "list of villages", data: result , success: true})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })    }
}
export async function getAllZone(req: Request, res: Response) {
    try {
        let zoneList = await zoneModal.find({})
        return res.status(201).send({mesage : "fetched successfully", success: true, result : zoneList})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getCountOfAllVillage(req: Request, res: Response) {
    try {
        let villageCount = await zoneModal.aggregate([
            { $unwind: "$blocks" },
            { $unwind: "$blocks.taluka.villages" },
            { $count: "totalVillages" }
          ])
        return res.status(201).send({message : "fetched successfully", success: true, result : villageCount})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getCountOfAllBlocks(req: Request, res: Response) {
    try {
        let blockCount = await zoneModal.aggregate([{ $unwind: "$blocks" },
        { $group: { _id: null, totalBlocks: { $sum: 1 } } }])
        return res.status(201).send({mesage : "fetched successfully", success: true, result : blockCount})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getBlockById(req: Request, res: Response) {
    try {
        let { id, blockUniqueId } = req.params;
        let result = await zoneModal.find({_id : new mongoose.Types.ObjectId(id),"blocks" :{$elemMatch:{"blockUniqueId":blockUniqueId }}}, { "blocks.$": 1 })
        if(!result) return res.status(400).json({message : "Block Id not found, Invalid ID"})
        return res.status(201).send({mesage : "block fetched successfully", success: true, data : result})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function isVillageDisbaleTrue(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let { blockUniqueId, talukaUniqueId, villageUniqueId } = req.body
        if(!blockUniqueId || !villageUniqueId || !talukaUniqueId) return res.status(400).send({ message: "Please send all required fields" })

        let isExistBlock = await zoneModal.findOne({"_id" :new mongoose.Types.ObjectId(id),"blocks" :{$elemMatch:{"taluka.talukaUniqueId":talukaUniqueId}}});
        if(!isExistBlock) return res.status(400).json({ message: "This taluka id is not exist, Invalid ID" })

        let isdisableTrue = await zoneModal.findOneAndUpdate({"blocks.blockUniqueId":blockUniqueId, "blocks.taluka.talukaUniqueId": talukaUniqueId,"blocks.taluka.villages.villageUniqueId": villageUniqueId },
                { $set: { "blocks.$[b].taluka.villages.$[v].isDisable": true } },
                { arrayFilters: [{ "b.blockUniqueId": blockUniqueId }, { "v.villageUniqueId": villageUniqueId }]})
        return res.status(201).send({ message: "succesfully disabled", success: true, data: isdisableTrue });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function uploadZoneData(req: any, res: Response) {
    try {
        // read the Excel sheet into a JavaScript object
        let path = req.file.path as any
        const workbook = xlsx.readFile(path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        let villagearray = [] as any;

        let districtName = '';
        let pincode = '';
        let blockUniqueId = '';
        let blockName = '';
        let talukaUniqueId = '';
        let talukaName = '';
        // const villageUniqueId = row.villageUniqueId;
        // const villageName = row.villageName;

        // const village = { villageName, villageUniqueId };
        let taluka = { talukaName, talukaUniqueId, villages: villagearray };
        let block = { blockName, blockUniqueId, taluka: taluka };
        let zone = { districtName, pincode, blocks: [block] };
        data.forEach(async (row: any) => {
            villagearray.push({
                villageName: row.villageName as any,
                villageUniqueId: row.villageUniqueId as any
            })
            districtName = row.districtName;
            pincode = row.pincode;
            blockUniqueId = row.blockUniqueId;
            blockName = row.blockName;
            talukaUniqueId = row.talukaUniqueId;
            talukaName = row.talukaName;
            
            taluka = { talukaName, talukaUniqueId, villages: villagearray };
            block = { blockName, blockUniqueId, taluka: taluka };
            zone = { districtName, pincode, blocks: [block] };
        })
        let exists = await zoneModal.findOne({ districtName: districtName }) as any
        if (!exists) {
            const zoneData = new zoneModal(zone);
            zoneData.save((err, result) => {
                if (err) {
                    res.send({ message: "SOMETHING WENT WRONG", data: err })
                } else {
                    res.send({ message: "inserted data", data: result })
                }
            });
        } else {
            let blockExist = await zoneModal.findOne({ districtName: districtName, "blocks": { $elemMatch: { "blockUniqueId": blockUniqueId } } }) as any
            if (blockExist) return res.status(400).send({ message: " this block already exist" })
            let payload = {
                blockName: blockName,
                blockUniqueId: blockUniqueId,
                taluka: {
                    talukaName: talukaName,
                    talukaUniqueId: talukaUniqueId,
                    villages: villagearray
                }

            }
            const setQuery = { $addToSet: { "blocks": { $each: [payload] } } };
            let updateData = await zoneModal.findOneAndUpdate({ pincode: pincode }, setQuery, { new: true });
            res.send({ message: "inserted data", data: updateData })
        }
        // let exists = await zoneModal.find({districtName: districtName}) as any
        // if(exists.length) {

        //     await zoneModal.findOneAndUpdate({"_id" : exists._id,"blocks": { $elemMatch: { "taluka.talukaUniqueId":talukaUniqueId } } },
        //     {
        //                   $addToSet: {
        //                       "blocks.$.taluka.villages": {
        //                           $each:villageArray
        //                       }
        //                   }
        //               },{new:true}) 
        // if(!exists.length) {





    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}