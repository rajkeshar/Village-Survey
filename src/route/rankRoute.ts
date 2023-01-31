import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewRank } from '../controller/rankController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewrank', addNewRank)



export default router;