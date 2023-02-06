import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import surveyModal from '../modal/inspecionModal'

export async function addNewSurvey(req: Request, res: Response) {
    try {
        let { surveyName, question, answer, villageName, departmentName, blockName, talukaName,
            districtName, surveyStartDate, surveyEndDate, surveyorName, surveyId } = req.body

        let existingSurvey = await surveyModal.find({ surveyName: surveyName }) as any
        if (existingSurvey.length) return res.status(400).json({ message: "survey  modal already exist" });

        if (!surveyId) {
            let newSurvey = new surveyModal({
                surveyName: surveyName, villageName: villageName, departmentName: departmentName, blockName: blockName,
                districtName: districtName, surveyStartDate: surveyStartDate, surveyEndDate: surveyEndDate, surveyorName: surveyorName
            });

            await newSurvey.save();

            return res.status(201).json({ message: "Survey created successfully", success: true, data: newSurvey });
        } else {
            let setQuery = {
                'questionnaire': [{
                    question: question, 
                    answer: answer
                }]
            };
            let updateSurvey = await surveyModal.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(surveyId) }, { setQuery }, { new: true });
            return res.status(201).json({ message: "Survey updated successfully", success: true, data: updateSurvey });
        }
    } catch (error) {
        res.status(500).json({ message: error, success: false });
    }
}
export async function updateNewSurvey(req: Request, res: Response) {
    try {

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function deleteSurvey(req: Request, res: Response) {
    try {

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function getSurveyById(req: Request, res: Response) {
    try {

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function getAllSurvey(req: Request, res: Response) {
    try {

    } catch (error) {
        res.status(500).send(error);
    }
}