import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewSurvey, deleteSurvey, getAllSurvey, getSurveyById, updateNewSurvey } from '../controller/inspectionController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewsurvey', addNewSurvey)
router.post('/updatesurvey/:id', updateNewSurvey)
router.get('/getsurveybyid/:id', getSurveyById)
router.get('/getallsurveylist', getAllSurvey)
router.post('/deletesurey/:id', deleteSurvey)


export default router;