import express, { application, NextFunction ,Request,Response} from 'express'
import { createConnection } from 'mongoose';
import { addNotification, getNotificationById, getNotificationList, updateNotification } from '../controller/notificationController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/createnotification', addNotification)
router.get('/getnotificationbyid/:id', getNotificationById)
router.get('/getallnotification', getNotificationList)
router.post('/updatenotification/:id', updateNotification)

export default router;