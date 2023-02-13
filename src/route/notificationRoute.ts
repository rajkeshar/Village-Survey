import express, { application, NextFunction ,Request,Response} from 'express'
import { sendNotifications } from '../controller/notificationontroller';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/sendnotifications', sendNotifications)

export default router;