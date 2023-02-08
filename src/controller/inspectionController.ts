import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import surveyModal from '../modal/inspecionModal'

export async function addNewSurvey(req: Request, res: Response) {
    try {
        let { surveyName, question, answer, villageName, departmentName, blockName, talukaName,
            districtName, surveyStartDate, surveyEndDate, surveyorName, surveyId } = req.body

        if (!surveyId) {
            if (!surveyName || !villageName || !departmentName || !blockName || !districtName) return res.status(400).json({ message: "PLease send required fields" });
            let existingSurvey = await surveyModal.find({ surveyName: surveyName, 'IsActive': true }) as any
            if (existingSurvey.length) return res.status(400).json({ message: "survey  modal already exist" });
            let newSurvey = new surveyModal({
                surveyName: surveyName, villageName: villageName, departmentName: departmentName, blockName: blockName,
                districtName: districtName, surveyStartDate: surveyStartDate, surveyEndDate: surveyEndDate, surveyorName: surveyorName
            });

            await newSurvey.save();

            return res.status(201).json({ message: "Survey created successfully", success: true, data: newSurvey });
        } else {
            let setQuery = {
                'questionnaire': {
                    question: question,
                    answer: answer
                }
            };
            let updateSurvey = await surveyModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(surveyId) }, { $addToSet: setQuery }, { new: true });
            return res.status(201).json({ message: "Survey updated successfully", success: true, data: updateSurvey });
        }
    } catch (error) {
        res.status(500).json({ error: error, success: false });
    }
}
export async function updateNewSurvey(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let payload = req.body;
        let filter = { _id: new mongoose.Types.ObjectId(id), 'IsActive': true };
        let existingDoc = await surveyModal.find(filter);
        if (!existingDoc.length) return res.status(400).json({ message: "This is not exist, Invalid ID" });
        if (req.body.questionId as any) {
            let setQuery = {
                $set: {
                    'questionnaire.$[e].question': req.body.question,
                    'questionnaire.$[e].answer': req.body.answer
                }
            }
            let arrayFilter = {
                arrayFilters: [
                    {
                        'e._id': new mongoose.Types.ObjectId(req.body.questionId)
                    }], new: true
            };
            let result = await surveyModal.findOneAndUpdate({ questionnaire: { $elemMatch: { "_id": new mongoose.Types.ObjectId(req.body.questionId) } } },
                setQuery, arrayFilter);
            return res.status(201).json({ message: "updated successfully", success: true, data: result })
        }
        let updatedDoc = await surveyModal.findOneAndUpdate(filter,
            payload, { new: true });
        return res.status(201).json({ message: "updated successfully", success: true, data: updatedDoc })
    } catch (error) {
        res.status(500).json({ error: error, success: false });
    }
}
export async function deleteSurvey(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let { questionId } = req.params;
        let filter = { _id: new mongoose.Types.ObjectId(id), 'IsActive': true };
        let existingDoc = await surveyModal.find(filter);
        if (!existingDoc.length) return res.status(400).json({ message: "This is not exist, Invalid ID" });

        if (questionId) {
            let updatedDoc = await surveyModal.findOneAndUpdate({ questionnaire: { $elemMatch: { "_id": new mongoose.Types.ObjectId(questionId) } } },
                { $pull: { 'questionnaire': { '_id': new mongoose.Types.ObjectId(questionId) } } })
            return res.status(201).json({ message: "deleted successfully", success: true, data: updatedDoc })
        } else {
            await surveyModal.findOneAndUpdate(filter, { $set: { 'IsActive': false } });
            return res.status(201).json({ message: "deleted successfully", success: true })
        }
    } catch (error) {
        res.status(500).json({ error: error, success: false });
    }
}
export async function getSurveyById(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let filter = { _id: new mongoose.Types.ObjectId(id), 'IsActive': true };
        let existingDoc = await surveyModal.find(filter);
        if (!existingDoc.length) return res.status(400).json({ message: "This is not exist, Invalid ID" });
        let result = await surveyModal.findOne({ _id: new mongoose.Types.ObjectId(id) });
        return res.status(201).json({ message: "fetched successfully", success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: error, success: false });
    }
}
export async function getAllSurvey(req: Request, res: Response) {
    try {
        let surveyList = await surveyModal.find({ 'IsActive': true });
        return res.status(201).json({ message: "fetched all successfully", success: true, data: surveyList })
    } catch (error) {
        res.status(500).json({ error: error, success: false });
    }
}