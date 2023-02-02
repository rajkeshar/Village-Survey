import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewZone, addNewVillage, deleteZone, getAllBlocks, getAllDistrict, getAllVillage, getZoneById, updateZone, getAllZone } from '../controller/zoneController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewzone', addNewZone)
router.post('/addnewvillage', addNewVillage)
router.post('/updatezone/:id', updateZone)
router.get('/getzonebyid/:id', getZoneById)
router.delete('/deletezone/:id', deleteZone)
router.get('/getallvillage', getAllVillage)
router.get('/getallblock', getAllBlocks)
router.get('/getalldistrict', getAllDistrict)
router.get('/getallzone', getAllZone)



export default router;