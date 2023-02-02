import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import zoneModal from '../modal/zoneModal'

export async function addNewZone(req: Request, res: Response) {
    try {
        let { blockUniqueId, blockName, villageName, villageUniqueId, zoneId,
            districtName, pincode } = req.body
       
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
                blockUniqueId: blockUniqueId
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
        res.status(500).send(error);
    }
}
export async function addNewVillage(req: Request, res: Response) {
    try {
        let { blockUniqueId, villageUniqueId, villageName } = req.body
        if(!blockUniqueId || !villageUniqueId || !villageName) return res.status(400).send({ message: "Please send all required fields" })

        let isExistBlock = zoneModal.find({"blocks" :{$elemMatch:{"blockUniqueId":blockUniqueId}}});
        if(!isExistBlock) res.status(400).send({ message: "This block id is not exist, Invalid ID" })

        let newVillage = zoneModal.findOneAndUpdate({ "blocks": { $elemMatch: { "blockUniqueId": blockUniqueId } } },
            {
                $addToSet: {
                    "blocks.$.villages": {
                        $each: [{
                            villageName: villageName,
                            villageUniqueId: villageUniqueId
                        }]
                    }
                }
            })
        return res.status(201).send({ message: "Zone created succesfully", success: true, data: newVillage });
    } catch (error) {
        res.status(500).send(error);
    }
}
export async function updateZone(req: Request, res: Response) {
    try {
        let {districtName, blockName,blockUniqueId , villageName, villageUniqueId} = req.body
        await zoneModal.findOneAndUpdate({_id : new mongoose.Types.ObjectId(req.params.id)},
        {$set : {districtName : districtName}})
        await zoneModal.findOneAndUpdate({_id : new mongoose.Types.ObjectId(req.params.id)},
            {$set : {"blocks.$[e].blockName" : blockName}},
            {arrayFilters:[{"e.blockUniqueId":blockUniqueId}]})
        await zoneModal.findOneAndUpdate({"blocks" :{$elemMatch:{"blockUniqueId":blockUniqueId}}},
                {$set : {"blocks.$[e].blockUniqueId.$[f].villageName" : villageName}},
                {arrayFilters:[{"e.blockUniqueId":blockUniqueId,"f.villageUniqueId":villageUniqueId}]})
    } catch (error) {
        res.status(500).send(error);
    }
}
export async function deleteZone(req: Request, res: Response) {
    try {
        let { id } =  req.params;
        let zone = await zoneModal.find({_id : new mongoose.Types.ObjectId(id)})
        if(!zone) return res.status(400).send({mesage : "This Id is not exist, Invalid ID"})
        await zoneModal.deleteOne({_id : new mongoose.Types.ObjectId(id)})
        return res.status(201).send({mesage : "Deleted successfully", success: true})
    } catch (error) {
        res.status(500).send(error);
    }
}
export async function deleteBlockOrVillage(req: Request, res: Response) {
    try {
        let { id , blockName, villageName, blockUniqueId} =  req.params;
        let zone = await zoneModal.find({_id : new mongoose.Types.ObjectId(id)})
        if(!zone) return res.status(400).send({mesage : "This Id is not exist, Invalid ID"})
        await zoneModal.findOneAndUpdate({_id : new mongoose.Types.ObjectId(id)},
        { $pull: { 'blocks':{ 'blockName': blockName }}})
        await zoneModal.findOneAndUpdate({_id : new mongoose.Types.ObjectId(id),
            "blocks" :{$elemMatch:{"blockUniqueId":blockUniqueId}}},
            { $pull: { 'blocks.$.villages':{ 'villageName': villageName }}})
        return res.status(201).send({mesage : "Deleted successfully", success: true})
    } catch (error) {
        res.status(500).send(error);
    }
}
export async function getZoneById(req: Request, res: Response) {
    try {
        let { id } =  req.params;
        let zone = zoneModal.find({_id : new mongoose.Types.ObjectId(id)})
        if(!zone) return res.status(400).send({mesage : "This Id is not exist, Invalid ID"})
        return res.status(201).send({mesage : "fetched successfully", success: true, result : zone})
    } catch (error) {
        res.status(500).send(error);
    }
}
export async function getAllDistrict(req: Request, res: Response) {
    try {

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function getAllBlocks(req: Request, res: Response) {
    try {

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function getAllVillage(req: Request, res: Response) {
    try {

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function getAllZone(req: Request, res: Response) {
    try {
        let { id } =  req.params;
        let zoneList = zoneModal.find({})
        return res.status(201).send({mesage : "fetched successfully", success: true, result : zoneList})
    } catch (error) {
        res.status(500).send(error);
    }
}