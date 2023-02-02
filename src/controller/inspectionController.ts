import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import surveyModal from '../modal/inspecionModal'

export async function addNewSurvey(req: Request, res: Response) {
    try {
        let { surveyName, question, answer, villageName, departmentName, blockName, talukaName,
            districtName, surveyStartDate, surveyEndDate, surveyorName, IsOnGoingSurvey, } = req.body


    } catch (error) {
        res.status(500).send(error);
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