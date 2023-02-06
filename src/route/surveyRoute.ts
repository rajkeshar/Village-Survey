import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewSurvey } from '../controller/inspectionController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewsurvey', addNewSurvey)



export default router;