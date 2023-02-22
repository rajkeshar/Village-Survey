import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import deptModal from '../modal/departmentModal'
import * as xlsx from "xlsx/xlsx";

export async function uploadExcelData(req: any, res: any) {
    try {
        let path = req.body.path;
        const workbook = xlsx.readFile(path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
   await deptModal.insertMany(sheetData, function(err, result) {
    console.log(`${result} documents were inserted`)
   })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function addNewDepartment(req: Request, res: Response) {
    try {
        let { deptName, schemeName, schemeId, deptId } = req.body
        if (!deptName) return res.status(400).send("Kindly send dept Name");

        
        let setQuery = { 
            deptName:deptName
            // "schemeDetails" :[{
            //     schemeId : schemeId , 
            //     schemeName : schemeName
            // }] 
        } as any 
        if(!deptId){
        let isAlreadyExist = await deptModal.findOne({ deptName }).lean() as any;
        if (isAlreadyExist) return res.status(400).send("This dept already exist");
            let newDept = new deptModal(setQuery)
            await newDept.save();
            return res.status(201).send({ message: "Succesfully created", data: newDept, success: true });
        } else {
            // const setQuery = {$set : {'schemeDetails.$[e].schemeName' : schemeName}};
            let payload = {
                schemeId : schemeId, 
                schemeName : schemeName
            }
            const setQuery = { $addToSet: { "schemeDetails": { $each: [payload]}}};
            const updatedept = await deptModal.findOneAndUpdate({ _id : new mongoose.Types.ObjectId(deptId)} , setQuery ,{new : true});
            return res.status(201).send({ message: "Succesfully added  scheme",data:updatedept, success: true });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function updateDepartment(req: Request, res: Response) {
    let { id } = req.params;
    try {

        let filter = { _id: new mongoose.Types.ObjectId(id) };
        let { schemeId, schemeName, deptName } = req.body;

        let isExist = await deptModal.findById({ _id: new mongoose.Types.ObjectId(id), 'IsActive': true })
        if (!isExist) return res.status(400).send({ message: 'This id is not exist, Invaild Id' })
        const setQuery = { $set: { deptName: deptName, 'schemeDetails.$[e].schemeName': schemeName } };
        //  const setQuery = { $addToSet: { "schemeDetails": { $each: [ schemeId , schemeName ]}}};
        const arrayFilter = { arrayFilters: [{ 'e.schemeId': schemeId }], new: true }
        let result = await deptModal.findOneAndUpdate(filter, setQuery, arrayFilter);
        return res.status(201).send({ message: 'Successfully updated', data: result, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getDepartmentById(req: Request, res: Response) {
    let { id } = req.params;
    try {

        let dept = await deptModal.findById({ _id: new mongoose.Types.ObjectId(id), 'IsActive': true })
        if (!dept) return res.status(400).send({ message: 'This id is not exist, Invaild Id' })

        return res.status(201).send({ message: 'Successfully updated', data: dept, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function deleteDepartment(req: Request, res: Response) {
    try {
        let { id } = req.params;
        const dept = await deptModal.findByIdAndDelete(id);

        if (!dept) res.status(404).send({ message: "No item found" });
        return res.status(200).send({ message: 'Successfully deleted', success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getAllDepartment(req: Request, res: Response) {
    const deptList = await deptModal.find({'IsActive' : true}).lean();
    try {
        let deptArray = [] as any; 
        deptList.map(x =>  {deptArray.push(x.deptName)});
        res.send({ message: "department list fetched successfully", data: deptArray });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getAllDepartmentAndScheme(req: Request, res: Response) {
    const deptList = await deptModal.find({'IsActive' : true});
    try {
        res.send({ message: "department list fetched successfully", data: deptList });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getSchemeByDepartment(req: Request, res: Response) {
    let { id } = req.params;
    try {
        const dept = await deptModal.findOne({ _id : new mongoose.Types.ObjectId(id), 'IsActive' : true}) as any
        if(!dept) return res.status(400).send({message : 'Dept id not found, Invalid Id'}); 
        let schemeDetail = dept.schemeDetails
        res.send({ message: "scheme list fetched successfully", data: schemeDetail });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function deleteScheme(req: Request, res: Response) {
    let { id,schemename } = req.params;
    try {
        const dept = await deptModal.findOne({ _id : new mongoose.Types.ObjectId(id), 'IsActive' : true}) as any
        if(!dept) return res.status(400).send({message : 'Dept id not found, Invalid Id'}); 
        let result = await deptModal.findOneAndUpdate({_id : new mongoose.Types.ObjectId(id)},
        { $pull: { 'schemeDetails':{ 'schemeName': schemename }}}) 
        res.send({ message: "scheme list fetched successfully", data: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function uploadSchemeData(req: Request, res: Response) {
    try {
        // read the Excel sheet into a JavaScript object
        let path = req.body.path;
        const workbook = xlsx.readFile(path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        // loop through the data and update the collection
        data.forEach((row) => {
            const deptName = row['deptName'];
            let exists =  deptModal.findOne({deptName : row.deptName})
            if(!exists){
                let payload = {
                    deptName : row.deptName,
                    schemeDetails : [
                        {
                            schemeId : row.schemeId, 
                            schemeName : row.schemeName,
                            'questionnaire':[
                                {
                                    question : row.question,
                                    range : row.range
                                }
                            ]
                        }
                    ]
                }
                let modal = new deptModal(payload)
                modal.save()
                    .then(() => {
                    })
                    .catch((err) => {
                        console.error(`Error updating ${deptName}:`, err);
                    });
            } else {
                let payload = {
                    schemeId : row.schemeId, 
                    schemeName : row.schemeName
                }
                
                 deptModal.findOneAndUpdate({deptName : row.deptName},{ $addToSet: { "schemeDetails": { $each: [payload]}}},{upsert:true})
                    .then(() => {
                    })
                    .catch((err) => {
                        console.error(`Error updating ${deptName}:`, err);
                    });
            }
        })
        res.send({message : "updated"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}