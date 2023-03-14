import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewSurvey, changeSurveyStatus, getSurveyDateRange,deleteSurvey, getAllSurvey,  getSurveyById, updateNewSurvey, submitSurvey } from '../controller/inspectionController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewsurvey', addNewSurvey)
router.post('/updatesurvey/:id', updateNewSurvey)
router.get('/getsurveybyid/:id', getSurveyById)
router.get('/changesurveystatus/:id', changeSurveyStatus)
router.get('/getallsurveylist', getAllSurvey)
router.post('/deletesurey/:id', deleteSurvey)
router.post('/getsurveydate', getSurveyDateRange)
router.post('/submitsurvey/:id', submitSurvey)


export default router;