import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import deptModal from '../modal/departmentModal'
import * as xlsx from "xlsx/xlsx";
import combinationModel from '../modal/combinationOfAssignVillageAndDept';
import submitSurveyModal from '../modal/submitSurveyModal';

// export async function uploadExcelData(req: any, res: any) {
//     try {
//         let path = req.body.path;
//         const workbook = xlsx.readFile(path);
//         const sheetName = workbook.SheetNames[0];
//         const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//    await deptModal.insertMany(sheetData, function(err, result) {
//     console.log(`${result} documents were inserted`)
//    })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
//     }
// }
export async function addNewDepartment(req: Request, res: Response) {
    try {
        let { deptName, schemeName, schemeId, deptId, question, range, answer } = req.body
        if (!deptName) return res.status(400).send("Kindly send dept Name");


        let setQuery = {
            deptName: deptName
            // "schemeDetails" :[{
            //     schemeId : schemeId , 
            //     schemeName : schemeName
            // }] 
        } as any
        if (!deptId) {
            let isAlreadyExist = await deptModal.findOne({ deptName }).lean() as any;
            if (isAlreadyExist) return res.status(400).send("This dept already exist");
            let newDept = new deptModal(setQuery)
            await newDept.save();
            return res.status(201).send({ message: "Succesfully created", data: newDept, success: true });
        } else {
            // const setQuery = {$set : {'schemeDetails.$[e].schemeName' : schemeName}};
            let payload = {
                schemeId: schemeId,
                schemeName: schemeName
            }
            const setQuery = { $addToSet: { "schemeDetails": { $each: [payload] } } };
            const updatedept = await deptModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(deptId) }, setQuery, { new: true });
            return res.status(201).send({ message: "Succesfully added  scheme", data: updatedept, success: true });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function updateQuestion(req: Request, res: Response) {
    let { id } = req.params;
    try {

        let filter = { _id: new mongoose.Types.ObjectId(id) };
        let { schemeId, question, answer, questionId, range, noofButtons, valueAgainstEveryRangeElement } = req.body;
        if (!answer) {
            answer = '';
        }
        let isExist = await deptModal.findById({ _id: new mongoose.Types.ObjectId(id), 'IsActive': true })
        if (!isExist) return res.status(400).send({ message: 'This id is not exist, Invaild Id' })

        if (questionId) {
            let result = await deptModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id), "schemeDetails.schemeId": schemeId, "schemeDetails.questionnaire._id": new mongoose.Types.ObjectId(questionId) },
                {
                    $set: {
                        "schemeDetails.$[scheme].questionnaire.$[question].question": question,
                        "schemeDetails.$[scheme].questionnaire.$[question].range": range,
                        "schemeDetails.$[scheme].questionnaire.$[question].noofButtons": noofButtons,
                        "schemeDetails.$[scheme].questionnaire.$[question].valueAgainstEveryRangeElement": valueAgainstEveryRangeElement,
                    }
                },
                { arrayFilters: [{ "scheme.schemeId": schemeId }, { "question._id": new mongoose.Types.ObjectId(questionId) }] })
            await deptModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id), "schemeDetails.schemeId": schemeId, "schemeDetails.questionnaire._id": new mongoose.Types.ObjectId(questionId) },
                { $set: { "schemeDetails.$[scheme].questionnaire.$[question].answer": answer } },
                { arrayFilters: [{ "scheme.schemeId": schemeId }, { "question._id": new mongoose.Types.ObjectId(questionId) }] })
            return res.status(201).send({ message: 'Successfully updated question', data: result, success: true });
        } else {
            // let query = { _id: new mongoose.Types.ObjectId(id), "schemeDetails.schemeId": schemeId }
            // let setQuery =  { $addToSet: { 'schemeDetails.$.questionnaire': { question: question, range: range } } }
            // let options = { new: true };
            let result = await deptModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id), "schemeDetails.schemeId": schemeId },
                {
                    $addToSet: {
                        'schemeDetails.$.questionnaire': {
                            question: question, answer: answer, range: range,
                            noofButtons: noofButtons, valueAgainstEveryRangeElement: valueAgainstEveryRangeElement
                        }
                    }
                }, { new: true })
            return res.status(201).send({ message: 'Successfully added new question', data: result, success: true });
        };
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

        let dept = await deptModal.findOne({ _id: new mongoose.Types.ObjectId(id), 'IsActive': true })
        if (!dept) return res.status(400).send({ message: 'This id is not exist, Invaild Id' })

        return res.status(201).send({ message: 'Successfully updated', data: dept, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function fetchDepartmentListById(req: Request, res: Response) {
    let { deptIds } = req.body;
    try {
        let deptArray = [] as any;
        // let deptName =''
        let schemeName = '' as any
        let schemeId = '' as any
        let range = '' as any
        let question = '' as any
        let questionId = '' as any
        let obj = {} as any;
        for (let id = 0; id < deptIds.length; id++) {
            let ID = deptIds[id]
            let dept:any = await deptModal.findOne({ _id: new mongoose.Types.ObjectId(ID), 'IsActive': true })
            console.log(dept.schemeDetails[0].questionnaire)
            const deptName = dept?.deptName;
            const deptId = dept?._id;
            dept?.schemeDetails.forEach(schemeDetail => {
                const schemeName = schemeDetail.schemeName;
                const schemeId = schemeDetail.schemeId;
                const schemeObj = { schemeName, schemeId };
                // deptArray.push(schemeObj);
                schemeDetail.questionnaire?.forEach((question: any) => {
                    const questionObj = {
                        question: question.question,
                        range: question.range,
                        valueAgainstEveryRangeElement:question.valueAgainstEveryRangeElement,
                        questionId: question._id,
                        schemeName,
                        schemeId,
                        deptName,
                        deptId
                    };
                    deptArray.push(questionObj);
                });
            });

        }
        let newArray:any = []
        deptIds.map((id:any)=>{
            let findDataOf:any = deptArray.filter((filterData:any)=>{
               return filterData.deptId == id   
            })
            newArray.push(findDataOf.length)
        })

        console.log(newArray)
        
        return res.status(201).send({ message: 'Successfully listed', data: deptArray,deptQuestionCount:newArray, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function deleteDepartment(req: Request, res: Response) {
    try {
        let { id } = req.params;
        const dept = await deptModal.findOne({ _id: new mongoose.Types.ObjectId(id) })

        if (!dept) return res.status(404).send({ message: "Id is not found, Invalid Id" });
        await deptModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) },
            { $set: { 'IsActive': false} });

        await combinationModel.deleteMany({ deptId:id });
        return res.status(200).send({ message: 'Successfully deleted', success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function   getAllDepartment(req: Request, res: Response) {
    const deptList = await deptModal.find({ IsActive: true }, { deptName: 1, _id: 1 })
    try {
        res.send({ message: "department list fetched successfully", success: true, data: deptList });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getAllDepartmentAndScheme(req: Request, res: Response) {
    const deptList = await deptModal.find({ 'IsActive': true,'isDisable':false, });
    try {
        res.send({ message: "department list fetched successfully", data: deptList });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}

export async function getAllDepartmentAndScheme2(req: Request, res: Response) {
    const deptList = await deptModal.find({ 'IsActive': true});
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
        const dept = await deptModal.findOne({ _id: new mongoose.Types.ObjectId(id), 'IsActive': true }) as any
        if (!dept) return res.status(400).send({ message: 'Dept id not found, Invalid Id' });
        let schemeDetail = dept.schemeDetails
        res.send({ message: "scheme list fetched successfully", data: schemeDetail });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getQuestionnaireByDepartment(req: Request, res: Response) {
    let { schemeId, questionnaireId } = req.body;
    try {
        if (!schemeId || !questionnaireId) return res.status(400).send({ message: "send schemeId and questionnaireId" });
        let questionDetails = await deptModal.findOne({
            "schemeDetails.schemeId": schemeId,
            "schemeDetails.questionnaire._id": new mongoose.Types.ObjectId(questionnaireId)
        }, { "schemeDetails.questionnaire.$": 1 })
        if (!questionDetails) return res.status(400).send({ message: "Id not found,Invalid Id" });
        return res.status(201).send({ message: "question list fetched successfully", data: questionDetails });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function deleteScheme(req: Request, res: Response) {
    let { id, schemeId } = req.params;
    try {
        const dept = await deptModal.findOne({ _id: new mongoose.Types.ObjectId(id), 'IsActive': true }) as any
        if (!dept) return res.status(400).send({ message: 'Dept id not found, Invalid Id' });
        let result = await deptModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) },
            { $pull: { 'schemeDetails': { 'schemeId': schemeId } } })
        res.send({ message: "scheme  deleted successfully", data: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function deleteQuestion(req: Request, res: Response) {
    let { id, schemeId, questionId } = req.params;
    try {
        const dept = await deptModal.findOne({ _id: new mongoose.Types.ObjectId(id), 'IsActive': true , "schemeDetails.schemeId": schemeId }) as any
        if (!dept) return res.status(400).send({ message: 'Dept id not found, Invalid Id' });
        let result = await deptModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) ,"schemeDetails.schemeId": schemeId },
        { $pull: { "schemeDetails.$.questionnaire": { _id: new mongoose.Types.ObjectId(questionId) } } })
        res.send({ message: "question deleted  successfully", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function uploadSchemeData(req: any, res: Response) {
    try {
        // read the Excel sheet into a JavaScript object
        let path = req.file.path as any
        const workbook = xlsx.readFile(path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        let schemeArray = [] as any;
        let questionArray = [] as any;
        let deptName = '';
        let schemeId = '';
        let schemeName = '';
        let question = '';
        let range = [] as any;
        let noofButtons = '';
        let valueAgainstEveryRangeElement = [] as any;
        // loop through the data and update the collection
        // data.forEach(async (row) => {
        //     deptName = row['deptName'];
        //     schemeId = row['schemeId'];
        //     schemeName = row['schemeName'];
        //     question = row['question'];
        //     range = row['range'];
        //     schemeArray.push({
        //         schemeId: schemeId,
        //         schemeName: schemeName,
        //         questionnaire: {
        //             question: question,
        //             range: JSON.parse(range)
        //         }
        //     })
        // })
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            deptName = row['deptName'];
            schemeId = row['schemeId'];
            schemeName = row['schemeName'];
            question = row['question'];
            range = row['range'];
            noofButtons = row['noofButtons'];
            valueAgainstEveryRangeElement = row['valueAgainstEveryRangeElement'];
            // let exists = await deptModal.findOne({ deptName: deptName, IsActive: true })
            let exists = await deptModal.findOne({ deptName: deptName, IsActive: true });
            if (exists) {
                let schemeIndex = exists.schemeDetails.findIndex(scheme => scheme.schemeId === schemeId);
                if (schemeIndex >= 0) {
                    exists.schemeDetails[schemeIndex].questionnaire.push({
                        question: question,
                        noofButtons: noofButtons,
                        range: JSON.parse(range),
                        valueAgainstEveryRangeElement: JSON.parse(valueAgainstEveryRangeElement)
                    });
                    await exists.save()
                    // .then(() => {
                    //     return res.status(200).send({ message: `dept updated:`, data: exists, success: true });
                    // })
                    // .catch((err) => {
                    //     return res.status(400).send({ message: `Error updating dept:`, data: err });
                    // });
                } else {
                    // Add new scheme to the existing department document
                    exists.schemeDetails.push({
                        schemeId: schemeId,
                        schemeName: schemeName,
                        questionnaire: [{
                            question: question,
                            noofButtons: noofButtons,
                            range: JSON.parse(range),
                            valueAgainstEveryRangeElement: JSON.parse(valueAgainstEveryRangeElement)
                        }]
                    });
                    await exists.save()
                    // .then(() => {
                    //     return res.status(200).send({ message: `dept updated:`, data: exists, success: true });
                    // })
                    // .catch((err) => {
                    //     return res.status(400).send({ message: `Error updating dept:`, data: err });
                    // });
                }
            } else {
                let payload = {
                    deptName: deptName,
                    schemeDetails: [{
                        schemeId: schemeId,
                        schemeName: schemeName,
                        questionnaire: [{
                            question: question,
                            noofButtons: noofButtons,
                            range: JSON.parse(range),
                            valueAgainstEveryRangeElement: JSON.parse(valueAgainstEveryRangeElement)
                        }]
                    }]
                }
                let modal = new deptModal(payload)
                await modal.save()
                // .then(() => {
                //     return res.status(201).send({ message: `dept Inserted:`, data: modal, success: true });
                // })
                // .catch((err) => {
                //     return res.status(201).send({ message: `Error updating ${deptName}:`, data: err });
            }   // });
        }
        return res.status(201).send({ message: `dept updated:`, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function disableDepartmentById(req: Request, res: Response) {
    let { id } = req.params;
    try {
        let {isDisable } = req.body ;
        let isExist = await deptModal.findOne({ _id: new mongoose.Types.ObjectId(id), 'IsActive': true })
        if (!isExist) return res.status(400).send({ message: 'This id is not exist, Invaild Id' })
        //  const setQuery = { $addToSet: { "schemeDetails": { $each: [ schemeId , schemeName ]}}};
        let result = await deptModal.findByIdAndUpdate( new mongoose.Types.ObjectId(id), { 'isDisable': isDisable },{new : true});
        let resultCombination = await combinationModel.updateMany({ deptId:id }, { isDisable: isDisable });
        return res.status(201).send({ message: 'Successfully updated', data: result, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}


export async function deptListAssign(req: Request, res: Response) {
    let { email,villageId,surveyId } = req.query 
    try {
       const assignDept:any =  await combinationModel.find({userEmail:email,villageId})
       const submitModelData:any = await submitSurveyModal.find({surveyId:surveyId})

    //    combinationModel.
       console.log(assignDept)
       console.log(submitModelData)
       function removeDuplicatesByDeptAndVillage(first, second) {
        // Create a set of unique combinations of deptId and villageId from the second array
        const uniqueCombinations = new Set();
      
        for (const item of second) {
          uniqueCombinations.add(`${item.surveyDetail.deptId.toString()}-${item.villageUniqueId}`);
        }
      
        // Filter the first array to remove items with the same combinations
        const filteredFirst = first.filter((item) => {
          const combination = `${item.deptId}-${item.villageId}`;
          return !uniqueCombinations.has(combination);
        });
      
        return filteredFirst;
      }

    let arr:any = removeDuplicatesByDeptAndVillage(assignDept,submitModelData)
    return res.status(200).json({ deptList:arr, success: true,status:200 })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}