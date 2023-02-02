import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewRank, getAllRank } from '../controller/rankController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewrank', addNewRank)
router.get('/getallrank', getAllRank)

export default router;